// src/lib/actions.ts
'use server'

import prisma from './prisma';
import { currentUser } from '@clerk/nextjs/server';

import { Role } from '@prisma/client';

export async function syncCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const userEmail = clerkUser.emailAddresses[0].emailAddress;
  const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Employee';

  const isAdmin = process.env.ADMIN_EMAIL && userEmail.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

  const dbUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: { 
      name: userName,
      ...(isAdmin ? { role: 'HOU' } : {})
    },
    create: {
      email: userEmail,
      name: userName,
      role: isAdmin ? 'HOU' : 'STAFF',
    }
  });

  return dbUser;
}

// Internal Notification Dispatch Engine
async function dispatchNotification(target: { role?: Role, userId?: string }, title: string, message: string, link?: string) {
  if (target.userId) {
    await prisma.notification.create({
      data: { userId: target.userId, title, message, link }
    });
  } else if (target.role) {
    const users = await prisma.user.findMany({ where: { role: target.role } });
    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map(u => ({
          userId: u.id,
          title,
          message,
          link
        }))
      });
    }
  }
}

export async function fetchNotifications() {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return [];
  
  return prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

export async function markNotificationRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    return { success: true };
  } catch (err) {
    return { error: "Failed" };
  }
}

export async function createBookingRequest(prevState: any, formData: FormData) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: "You must be logged in" };

  const progName = formData.get('progName') as string;
  const type = formData.get('type') as string;
  const dateOfRecordingStr = formData.get('dateOfRecording') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const producer = formData.get('producer') as string;
  const presenter = formData.get('presenter') as string || "N/A";
  const producerEmail = formData.get('producerEmail') as string || null;
  const presenterEmail = formData.get('presenterEmail') as string || null;
  const providedDuration = formData.get('duration') as string;

  if (!progName || !type || !dateOfRecordingStr || !startTime || !endTime || !producer) {
    return { error: "Please fill in all required fields." };
  }

  if (startTime >= endTime) return { error: "End time must be after start time." };

  // Parse date
  const dateOfRecording = new Date(dateOfRecordingStr);

  // Check for clashes
  const existingBookings = await prisma.studioBooking.findMany({
    where: {
      dateOfRecording,
      status: { not: 'DENIED' }
    }
  });

  const isClashing = existingBookings.some(booking => {
    const parts = booking.timeOfRecording.split('-');
    if (parts.length !== 2) return false;
    const [existStart, existEnd] = parts;

    // Clash condition: maxStart < minEnd
    const maxStart = startTime > existStart ? startTime : existStart;
    const minEnd = endTime < existEnd ? endTime : existEnd;

    return maxStart < minEnd;
  });

  if (isClashing) {
    return { error: "The selected time slot overlaps with an existing booking." };
  }

  // Calculate duration string e.g., "2h 30m" if not provided
  let durationStr = providedDuration;
  if (!durationStr) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let durationMins = (endH * 60 + endM) - (startH * 60 + startM);
    let durationHours = Math.floor(durationMins / 60);
    let remainderMins = durationMins % 60;
    durationStr = `${durationHours}h ${remainderMins > 0 ? remainderMins + 'm' : ''}`.trim();
  }

  const newBooking = await prisma.studioBooking.create({
    data: {
      progName,
      dateOfRecording,
      timeOfRecording: `${startTime}-${endTime}`,
      duration: durationStr,
      mode: type,
      producer,
      presenter,
      producerEmail,
      presenterEmail,
      status: 'PENDING',
      requesterId: dbUser.id
    }
  });

  // Notify HOU that a new booking arrived
  await dispatchNotification(
    { role: 'HOU' }, 
    "New Studio Request", 
    `${dbUser.name} submitted a new Studio Request. Action required.`,
    "/dashboard/workflows"
  );

  return { success: true };
}

export async function createMarketingJobRequest(prevState: any, formData: FormData) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: "You must be logged in" };

  const location = formData.get("location") as string;
  const dateOfAssignmentStr = formData.get("dateOfAssignment") as string;
  const timeOfAssignment = formData.get("timeOfAssignment") as string;
  const jobDescription = formData.get("jobDescription") as string;

  if (!location || !dateOfAssignmentStr || !timeOfAssignment || !jobDescription) {
    return { error: "Please fill in all required fields." };
  }

  const dateOfAssignment = new Date(dateOfAssignmentStr);

  const newJob = await prisma.marketingJob.create({
    data: {
      location,
      dateOfAssignment,
      timeOfAssignment,
      jobDescription,
      status: 'PENDING',
      requesterId: dbUser.id
    }
  });

  // Notify HOU that a new job arrived
  await dispatchNotification(
    { role: 'HOU' }, 
    "New Marketing Job", 
    `${dbUser.name} submitted a new Marketing Job. Action required.`,
    "/dashboard/workflows"
  );

  return { success: true };
}

export async function updateUserRole(userId: string, newRole: Role) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: "You must be logged in" };

  if (dbUser.role !== 'ENG_MGR' && dbUser.role !== 'HOU') {
    return { error: "Unauthorized. You do not have permission to manage roles." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    return { success: true };
  } catch (err) {
    return { error: "Failed to update user role." };
  }
}

export async function updateBookingStatus(
  id: string, 
  type: 'STUDIO' | 'MARKETING', 
  targetStatus: 'HOU_APPROVED' | 'APPROVED' | 'DENIED'
) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: "You must be logged in" };

  const role = dbUser.role;
  if (role !== 'ENG_MGR' && role !== 'HOU') {
    return { error: "Unauthorized. Managers only." };
  }

  // Security Check Logic
  if (targetStatus === 'HOU_APPROVED' && role !== 'HOU') {
    return { error: "Only Head of Unit can perform the primary approval." };
  }
  if (targetStatus === 'APPROVED' && role !== 'ENG_MGR') {
    return { error: "Only Engineering Manager can finalize the approval." };
  }

  // Execute
  try {
    let requesterId = "";
    if (type === 'STUDIO') {
      const updated = await prisma.studioBooking.update({
        where: { id },
        data: { status: targetStatus, approverId: dbUser.id }
      });
      requesterId = updated.requesterId;
    } else {
      const updated = await prisma.marketingJob.update({
        where: { id },
        data: { status: targetStatus, approverId: dbUser.id }
      });
      requesterId = updated.requesterId;
    }

    // Dynamic Engine Dispatch
    if (targetStatus === 'HOU_APPROVED') {
       // Notify ENG_MGR to finalize
       await dispatchNotification(
         { role: 'ENG_MGR' }, 
         "Approval Finalization Required", 
         `The Head of Unit has approved a ${type.toLowerCase()} request. Requires your signature.`,
         "/dashboard/workflows"
       );
       // Notify Requester
       await dispatchNotification(
         { userId: requesterId }, 
         "Primary Approval Complete", 
         `Your ${type.toLowerCase()} request has been approved by the Head of Unit and is processing.`
       );
    } else if (targetStatus === 'APPROVED') {
       await dispatchNotification(
         { userId: requesterId }, 
         "Request Approved!", 
         `✅ Your ${type.toLowerCase()} request has been fully finalized and approved.`
       );
    } else if (targetStatus === 'DENIED') {
       await dispatchNotification(
         { userId: requesterId }, 
         "Request Denied", 
         `❌ Unfortunately, your ${type.toLowerCase()} request has been denied by Management.`
       );
    }

    return { success: true };
  } catch (err) {
    return { error: "Failed to update the status." };
  }
}

// ==========================================
// GEAR VAULT (INVENTORY) API ACTIONS
// ==========================================

export async function updateEquipmentStatus(
  equipmentId: string,
  status: 'AVAILABLE' | 'IN_MAINTENANCE' | 'RETIRED'
) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: 'You must be logged in' };
  if (dbUser.role !== 'ENG_MGR' && dbUser.role !== 'HOU') {
    return { error: 'Unauthorized. Managers only.' };
  }

  try {
    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) return { error: 'Equipment not found.' };

    // When sending to maintenance, zero out available quantity
    const data: any = { status };
    if (status === 'IN_MAINTENANCE' || status === 'RETIRED') {
      data.availableQuantity = 0;
    } else if (status === 'AVAILABLE') {
      // Restore available quantity when bringing back
      data.availableQuantity = equipment.quantity;
    }

    await prisma.equipment.update({ where: { id: equipmentId }, data });
    return { success: true };
  } catch {
    return { error: 'Failed to update equipment status.' };
  }
}

export async function createEquipment(prevState: any, formData: FormData) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: "You must be logged in" };
  if (dbUser.role !== 'ENG_MGR' && dbUser.role !== 'HOU') {
    return { error: "Unauthorized. Managers only." };
  }

  const name = formData.get('name') as string;
  const serialNumber = formData.get('serialNumber') as string;
  const category = formData.get('category') as string;
  const condition = formData.get('condition') as string;
  const notes = formData.get('notes') as string;
  const quantityStr = formData.get('quantity') as string;

  if (!name || !category) return { error: "Name and category are required." };

  const quantity = parseInt(quantityStr) || 1;
  if (quantity < 1) return { error: "Quantity must be at least 1." };

  await prisma.equipment.create({
    data: {
      name,
      serialNumber: serialNumber || null,
      category: category as any,
      condition: condition || null,
      notes: notes || null,
      quantity,
      availableQuantity: quantity,
      status: 'AVAILABLE',
    }
  });

  return { success: true };
}

export async function requestEquipmentCheckout(prevState: any, formData: FormData) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: "You must be logged in" };

  const equipmentId = formData.get('equipmentId') as string;
  const expectedReturnDateStr = formData.get('expectedReturnDate') as string;
  const checkoutNotes = formData.get('checkoutNotes') as string;
  const quantityStr = formData.get('quantityRequested') as string;

  if (!equipmentId || !expectedReturnDateStr) return { error: "Expected return date is required." };

  const expectedReturnDate = new Date(expectedReturnDateStr);
  if (expectedReturnDate < new Date()) return { error: "Return date must be in the future." };

  const quantityRequested = Math.max(1, parseInt(quantityStr) || 1);

  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment || equipment.availableQuantity < quantityRequested) {
    return { error: `Only ${equipment?.availableQuantity ?? 0} unit(s) available. Reduce your request.` };
  }

  const newAvailable = equipment.availableQuantity - quantityRequested;
  await prisma.$transaction([
    prisma.equipmentCheckout.create({
      data: { equipmentId, requesterId: dbUser.id, expectedReturnDate, checkoutNotes, quantityRequested, status: 'PENDING' }
    }),
    prisma.equipment.update({
      where: { id: equipmentId },
      data: { availableQuantity: newAvailable, status: newAvailable <= 0 ? 'CHECKED_OUT' : 'AVAILABLE' }
    })
  ]);

  await dispatchNotification(
    { role: 'ENG_MGR' },
    "New Gear Vault Checkout Request",
    `${dbUser.name} requested ${quantityRequested}x ${equipment.name}. Action required.`,
    "/dashboard/inventory"
  );

  return { success: true };
}

export async function updateEquipmentCheckoutStatus(
  checkoutId: string,
  targetStatus: 'APPROVED' | 'REJECTED' | 'RETURNED'
) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: "You must be logged in" };
  if (dbUser.role !== 'ENG_MGR' && dbUser.role !== 'HOU') return { error: "Unauthorized." };

  try {
    const currentCheckout = await prisma.equipmentCheckout.findUnique({
      where: { id: checkoutId },
      include: { equipment: true }
    });
    if (!currentCheckout) return { error: "Checkout record not found." };

    const qty = currentCheckout.quantityRequested;

    if (targetStatus === 'APPROVED') {
      await prisma.equipmentCheckout.update({ where: { id: checkoutId }, data: { status: 'APPROVED', approverId: dbUser.id } });
      await dispatchNotification({ userId: currentCheckout.requesterId }, "Gear Checkout Approved", `✅ You can collect ${qty}x ${currentCheckout.equipment.name} from the vault.`);
    } else if (targetStatus === 'REJECTED') {
      const restored = currentCheckout.equipment.availableQuantity + qty;
      await prisma.$transaction([
        prisma.equipmentCheckout.update({ where: { id: checkoutId }, data: { status: 'REJECTED', approverId: dbUser.id } }),
        prisma.equipment.update({ where: { id: currentCheckout.equipmentId }, data: { availableQuantity: { increment: qty }, status: 'AVAILABLE' } })
      ]);
      await dispatchNotification({ userId: currentCheckout.requesterId }, "Gear Checkout Rejected", `❌ Your request for ${qty}x ${currentCheckout.equipment.name} was rejected.`);
    } else if (targetStatus === 'RETURNED') {
      const newAvail = currentCheckout.equipment.availableQuantity + qty;
      await prisma.$transaction([
        prisma.equipmentCheckout.update({ where: { id: checkoutId }, data: { status: 'RETURNED', actualReturnDate: new Date() } }),
        prisma.equipment.update({
          where: { id: currentCheckout.equipmentId },
          data: { availableQuantity: { increment: qty }, status: newAvail >= currentCheckout.equipment.quantity ? 'AVAILABLE' : 'CHECKED_OUT' }
        })
      ]);
      await dispatchNotification({ userId: currentCheckout.requesterId }, "Gear Return Verified", `${qty}x ${currentCheckout.equipment.name} returned and logged.`);
    }

    return { success: true };
  } catch (err) {
    return { error: "Database transaction failed." };
  }
}

// ==========================================
// DUTY ROSTER API ACTIONS
// ==========================================

export async function fetchMonthlyRoster(year: number, month: number) {
  // month is 0-indexed (JS Date convention)
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const entries = await prisma.dutyRoster.findMany({
    where: { date: { gte: start, lte: end } },
    include: { engineer: { select: { id: true, name: true, email: true } } },
    orderBy: { date: 'asc' }
  });

  return entries.map(e => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function assignDuty(engineerId: string, dateStr: string, notes?: string) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: 'You must be logged in' };
  if (dbUser.role !== 'ENG_MGR' && dbUser.role !== 'HOU') {
    return { error: 'Unauthorized. Managers only.' };
  }

  // Normalise to midnight UTC so the @@unique constraint works correctly
  const date = new Date(dateStr);
  date.setUTCHours(0, 0, 0, 0);

  try {
    await prisma.dutyRoster.create({
      data: { date, engineerId, notes: notes || null, createdById: dbUser.id }
    });

    // Notify the engineer
    const dateLabel = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    await dispatchNotification(
      { userId: engineerId },
      'You\'ve been assigned to duty',
      `📅 You are on duty for ${dateLabel}. Stay ready!`,
      '/dashboard/roster'
    );

    return { success: true };
  } catch (err: any) {
    if (err?.code === 'P2002') return { error: 'This engineer is already on duty that day.' };
    return { error: 'Failed to assign duty.' };
  }
}

export async function removeDuty(dutyId: string) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: 'You must be logged in' };
  if (dbUser.role !== 'ENG_MGR' && dbUser.role !== 'HOU') {
    return { error: 'Unauthorized. Managers only.' };
  }

  try {
    await prisma.dutyRoster.delete({ where: { id: dutyId } });
    return { success: true };
  } catch {
    return { error: 'Failed to remove duty assignment.' };
  }
}

// ==========================================
// FAULT REPORT / IT TICKETING ACTIONS
// ==========================================

export async function createFaultReport(prevState: any, formData: FormData) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: 'You must be logged in' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const location = formData.get('location') as string;
  const priority = formData.get('priority') as string;

  if (!title || !description || !location) {
    return { error: 'Title, description, and location are required.' };
  }

  await prisma.faultReport.create({
    data: {
      title,
      description,
      location,
      priority: priority as any || 'MEDIUM',
      reporterId: dbUser.id,
    }
  });

  // Notify all engineers and managers
  await dispatchNotification(
    { role: 'ENG_MGR' },
    '🔴 New Fault Report',
    `${dbUser.name} reported: "${title}" at ${location}`,
    '/dashboard/faults'
  );
  await dispatchNotification(
    { role: 'PROG_ENG' },
    '🔴 New Fault Report',
    `${dbUser.name} reported: "${title}" at ${location}`,
    '/dashboard/faults'
  );

  return { success: true };
}

export async function updateFaultReport(
  faultId: string,
  updates: { status?: string; assigneeId?: string; resolvedNote?: string }
) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) return { error: 'You must be logged in' };

  const isPrivileged = dbUser.role === 'ENG_MGR' || dbUser.role === 'HOU' || dbUser.role === 'PROG_ENG';
  if (!isPrivileged) return { error: 'Unauthorized.' };

  try {
    const fault = await prisma.faultReport.findUnique({
      where: { id: faultId },
      include: { reporter: { select: { id: true, name: true } } }
    });
    if (!fault) return { error: 'Fault report not found.' };

    await prisma.faultReport.update({
      where: { id: faultId },
      data: {
        ...(updates.status && { status: updates.status as any }),
        ...(updates.assigneeId !== undefined && { assigneeId: updates.assigneeId || null }),
        ...(updates.resolvedNote && { resolvedNote: updates.resolvedNote }),
      }
    });

    // Notify the original reporter when status changes
    if (updates.status === 'IN_PROGRESS') {
      await dispatchNotification(
        { userId: fault.reporterId },
        'Fault Report In Progress',
        `Your report "${fault.title}" is being worked on by engineering.`,
        '/dashboard/faults'
      );
    } else if (updates.status === 'RESOLVED') {
      await dispatchNotification(
        { userId: fault.reporterId },
        '✅ Fault Resolved',
        `Your report "${fault.title}" has been resolved.${updates.resolvedNote ? ' Note: ' + updates.resolvedNote : ''}`,
        '/dashboard/faults'
      );
    }

    // Notify the assignee if being assigned
    if (updates.assigneeId && updates.assigneeId !== fault.assigneeId) {
      await dispatchNotification(
        { userId: updates.assigneeId },
        'Fault Assigned To You',
        `You have been assigned to fix: "${fault.title}" at ${fault.location}`,
        '/dashboard/faults'
      );
    }

    return { success: true };
  } catch {
    return { error: 'Failed to update fault report.' };
  }
}