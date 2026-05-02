
import * as fs from 'fs';
import * as path from 'path';

const getLogo = (): string => {
  const buffer = fs.readFileSync(path.join(__dirname, 'decave-logo.png'));
  return `data:image/png;base64,${buffer.toString('base64')}`;
};


interface ReminderEmailData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventAddress: string;
  daysUntil: number;
  banner: string | null;
}

export const reminderEmailTemplate = ({
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  eventAddress,
  daysUntil,
  banner,
}: ReminderEmailData): string => {
  const logoBase64 = getLogo();

  const urgencyColor =
    daysUntil <= 3 ? '#ef4444' : daysUntil <= 7 ? '#f97316' : '#FFD159';

  const urgencyLabel =
    daysUntil === 1
      ? 'Tomorrow!'
      : daysUntil <= 3
      ? 'Very soon!'
      : daysUntil <= 7
      ? 'This week!'
      : `${daysUntil} days away`;

  return `
<div style="font-family: Arial, Helvetica, sans-serif; background:#0A0A0A; padding:40px; margin:0;">
  <div style="max-width:600px; margin:auto; background:#111111; border-radius:16px; overflow:hidden;">

    <!-- Header -->
    <div style="background:#FFD159; padding:24px 32px; text-align:center;">
      <img src="${logoBase64}" alt="DeCave" style="height:45px; object-fit:contain;" />
    </div>

    ${
      banner
        ? `<div>
      <img src="${banner}" alt="${eventTitle}"
        style="width:100%; height:200px; object-fit:cover; display:block;" />
    </div>`
        : `<div style="background:#1A1A1A; height:100px; text-align:center; padding-top:32px;">
      <span style="font-size:40px;">🎪</span>
    </div>`
    }

    <!-- Hero -->
    <div style="padding:40px 40px 24px; text-align:center;">
      <div style="display:inline-block; background:${urgencyColor}18; border:1px solid ${urgencyColor}40;
        border-radius:100px; padding:6px 18px; margin-bottom:20px;">
        <span style="color:${urgencyColor}; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">
          ${urgencyLabel}
        </span>
      </div>
      <h2 style="margin:0 0 10px; font-size:26px; font-weight:700; color:#F9F7F4; line-height:1.2;">
        Your event is coming up! 🎉
      </h2>
      <p style="margin:0; color:#888; font-size:14px; line-height:1.7;">
        A friendly reminder — you have a ticket to an upcoming event.
      </p>
    </div>

    <!-- Divider -->
    <div style="margin:0 40px; border-top:1px solid #222;"></div>

    <!-- Event Title -->
    <div style="padding:28px 40px 0;">
      <p style="margin:0 0 6px; color:#FFD159; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">
        You're attending
      </p>
      <p style="margin:0; font-size:22px; font-weight:700; color:#F9F7F4; letter-spacing:-0.3px;">
        ${eventTitle}
      </p>
    </div>

    <!-- Details -->
    <div style="padding:20px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
        <tr>
          <td width="50%" style="padding-right:6px; vertical-align:top;">
            <div style="background:#1A1A1A; border:1px solid #222; border-radius:10px; padding:16px;">
              <p style="margin:0 0 5px; color:#555; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">📅 Date</p>
              <p style="margin:0; color:#F9F7F4; font-size:13px; font-weight:600; line-height:1.4;">${eventDate}</p>
            </div>
          </td>
          <td width="50%" style="padding-left:6px; vertical-align:top;">
            <div style="background:#1A1A1A; border:1px solid #222; border-radius:10px; padding:16px;">
              <p style="margin:0 0 5px; color:#555; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">🕖 Time</p>
              <p style="margin:0; color:#F9F7F4; font-size:13px; font-weight:600;">${eventTime} WAT</p>
            </div>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td width="100%">
            <div style="background:#1A1A1A; border:1px solid #222; border-radius:10px; padding:16px;">
              <p style="margin:0 0 5px; color:#555; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">📍 Venue</p>
              <p style="margin:0; color:#F9F7F4; font-size:13px; font-weight:600;">${eventVenue}</p>
              <p style="margin:4px 0 0; color:#666; font-size:12px;">${eventAddress}</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Tip -->
    <div style="margin:0 40px 28px;">
      <div style="background:#1A1A1A; border-left:3px solid #FFD159; border-radius:0 8px 8px 0; padding:14px 16px;">
        <p style="margin:0; color:#888; font-size:13px; line-height:1.7;">
          💡 <strong style="color:#F9F7F4;">Reminder:</strong> Your QR code ticket was sent when you completed your purchase.
          Check your inbox and have it ready at the entrance for smooth check-in.
        </p>
      </div>
    </div>

    <!-- Divider -->
    <div style="margin:0 40px; border-top:1px solid #222;"></div>

    <!-- Footer -->
    <div style="padding:24px 40px; text-align:center;">
      <p style="margin:0 0 8px; color:#555; font-size:12px;">
        Questions? Reach us at
        <a href="mailto:support@decavemgt.com" style="color:#FFD159; text-decoration:none;">support@decavemgt.com</a>
      </p>
      <p style="margin:0; color:#444; font-size:11px;">© ${new Date().getFullYear()} DeCave. All rights reserved.</p>
    </div>

  </div>
</div>
  `.trim();
};