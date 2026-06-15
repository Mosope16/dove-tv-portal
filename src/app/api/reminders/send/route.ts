import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendBookingReminder } from '@/lib/email';

export async function GET(req: NextRequest) {
  // Protect the endpoint with a secret so only authorised callers can trigger it
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 55 * 60 * 1000);  // 55 min from now
  const windowEnd   = new Date(now.getTime() + 75 * 60 * 1000);  // 75 min from now

  // Find approved bookings whose recording starts within the 55–75 min window
  const bookings = await prisma.studioBooking.findMany({
    where: {
      status: 'APPROVED',
      reminderSent: false,
      dateOfRecording: { gte: windowStart, lte: windowEnd },
    },
    include: {
      requester: { select: { name: true, email: true } },
    },
  });

  if (bookings.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No upcoming bookings in window.' });
  }

  const results: { booking: string; sent: string[]; errors: string[] }[] = [];

  for (const booking of bookings) {
    const sent: string[] = [];
    const errors: string[] = [];

    const recordingDate = new Date(booking.dateOfRecording);
    const dateLabel = recordingDate.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const basePayload = {
      programName: booking.progName,
      date: dateLabel,
      time: booking.timeOfRecording,
      mode: booking.mode,
      producer: booking.producer,
    };

    // 1. Notify the requester (always)
    try {
      await sendBookingReminder({
        ...basePayload,
        recipientName: booking.requester.name,
        recipientEmail: booking.requester.email,
      });
      sent.push(booking.requester.email);
    } catch (e: any) {
      errors.push(`requester: ${e.message}`);
    }

    // 2. Notify the producer (if email provided)
    if (booking.producerEmail) {
      try {
        await sendBookingReminder({
          ...basePayload,
          recipientName: booking.producer,
          recipientEmail: booking.producerEmail,
        });
        sent.push(booking.producerEmail);
      } catch (e: any) {
        errors.push(`producer: ${e.message}`);
      }
    }

    // 3. Notify the presenter (if email provided)
    if (booking.presenterEmail && booking.presenter !== 'N/A') {
      try {
        await sendBookingReminder({
          ...basePayload,
          recipientName: booking.presenter,
          recipientEmail: booking.presenterEmail,
        });
        sent.push(booking.presenterEmail);
      } catch (e: any) {
        errors.push(`presenter: ${e.message}`);
      }
    }

    // Mark reminder as sent regardless (avoids duplicate spam on partial send)
    await prisma.studioBooking.update({
      where: { id: booking.id },
      data: { reminderSent: true },
    });

    results.push({ booking: booking.progName, sent, errors });
  }

  return NextResponse.json({ sent: results.length, results });
}
