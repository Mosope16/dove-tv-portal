import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type ReminderPayload = {
  recipientName: string;
  recipientEmail: string;
  programName: string;
  date: string;       // e.g. "Monday, 14 April 2026"
  time: string;       // e.g. "19:00"
  mode: string;       // "LIVE" or "PRE_RECORDED"
  producer: string;
};

export async function sendBookingReminder(payload: ReminderPayload) {
  const { recipientName, recipientEmail, programName, date, time, mode, producer } = payload;

  const modeLabel = mode === 'LIVE' ? '🔴 LIVE Broadcast' : '🎬 Pre-recorded Session';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">⏰ Studio Reminder</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Dove TV Production Portal</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="margin:0 0 8px;font-size:16px;color:#334155;">Hi <strong>${recipientName}</strong>,</p>
                    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                      This is your 1-hour reminder for an upcoming studio session.
                    </p>

                    <!-- Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                      <tr>
                        <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Program</p>
                          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1e293b;">${programName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Date</p>
                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#334155;">${date}</p>
                              </td>
                              <td width="50%">
                                <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Time</p>
                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#334155;">${time}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Format</p>
                          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#334155;">${modeLabel}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 24px;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Producer</p>
                          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#334155;">${producer}</p>
                        </td>
                      </tr>
                    </table>

                    <div style="background:#fefce8;border:1px solid #fde047;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
                      <p style="margin:0;font-size:13px;color:#713f12;line-height:1.5;">
                        📍 Please ensure you are in the studio <strong>at least 15 minutes early</strong> for setup and soundcheck.
                      </p>
                    </div>

                    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                      This reminder was sent automatically by the Dove TV Production Portal.<br/>
                      Do not reply to this email.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
                    <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">© ${new Date().getFullYear()} Dove TV · Production Portal</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Dove TV <reminders@yourdomain.com>',
    to: recipientEmail,
    subject: `⏰ Reminder: "${programName}" begins in 1 hour`,
    html,
  });

  if (error) throw new Error(error.message);
}
