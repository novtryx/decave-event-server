import * as fs from 'fs';
import * as path from 'path';

const getLogo = (): string => {
  const buffer = fs.readFileSync(path.join(__dirname, 'decave-logo.png'));
  return `data:image/png;base64,${buffer.toString('base64')}`;
};


export const welcomeEmailTemplate = ({ user }: { user: { name: string; email: string } }) => {
    const logoBase64 = getLogo();
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#0A0A0A; padding:40px; margin:0;">
    <div style="max-width:600px; margin:auto; background:#111111; border-radius:16px; overflow:hidden;">
      
      <!-- Header -->
      <div style="background:#FFD159; padding:24px 32px; text-align:center;">
        <img src="${logoBase64}" alt="DeCave" style="height:45px; object-fit:contain;" />
      </div>

      <!-- Hero -->
      <div style="padding:48px 40px 32px; text-align:center;">
        <div style="display:inline-block; width:72px; height:72px; background:#1A1A1A; border:2px solid #FFD159; border-radius:50%; line-height:72px; margin-bottom:24px;">
          <span style="font-size:32px;">🚀</span>
        </div>
        <h2 style="margin:0 0 12px; font-size:26px; font-weight:700; color:#F9F7F4;">You're In!</h2>
        <p style="margin:0; color:#888; font-size:15px;">Your organiser account is ready to go.</p>
      </div>

      <!-- Greeting -->
      <div style="padding:0 40px 32px;">
        <p style="margin:0 0 16px; color:#F9F7F4; font-size:16px;">Hi <strong style="color:#FFD159;">${user.name}</strong>,</p>
        <p style="margin:0 0 16px; color:#888; font-size:14px; line-height:1.8;">
          Welcome to DeCave — the platform built for event organisers like you. 
          You now have everything you need to create events, manage tickets, and track attendance all in one place.
        </p>
      </div>

      <!-- Divider -->
      <div style="margin:0 40px; border-top:1px solid #222;"></div>

      <!-- What's Next -->
      <div style="padding:32px 40px;">
        <p style="margin:0 0 20px; color:#FFD159; font-size:12px; font-weight:700; letter-spacing:1px;">WHAT YOU CAN DO</p>
        
        <div style="margin-bottom:16px;">
          <div style="background:#1A1A1A; border:1px solid #FFD159; border-radius:8px; padding:16px;">
            <p style="margin:0 0 4px; color:#F9F7F4; font-size:14px; font-weight:600;">🎪 Create Events</p>
            <p style="margin:0; color:#888; font-size:13px;">Set up your event in minutes — add details, dates, venue, and go live.</p>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="background:#1A1A1A; border:1px solid #222; border-radius:8px; padding:16px;">
            <p style="margin:0 0 4px; color:#F9F7F4; font-size:14px; font-weight:600;">🎟 Manage Tickets</p>
            <p style="margin:0; color:#888; font-size:13px;">Create multiple ticket types, set prices, and control availability with ease.</p>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="background:#1A1A1A; border:1px solid #222; border-radius:8px; padding:16px;">
            <p style="margin:0 0 4px; color:#F9F7F4; font-size:14px; font-weight:600;">✅ Track Attendance</p>
            <p style="margin:0; color:#888; font-size:13px;">Scan QR codes at the door and monitor check-ins in real time.</p>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="background:#1A1A1A; border:1px solid #222; border-radius:8px; padding:16px;">
            <p style="margin:0 0 4px; color:#F9F7F4; font-size:14px; font-weight:600;">📊 View Analytics</p>
            <p style="margin:0; color:#888; font-size:13px;">Get insights on ticket sales, revenue, and attendance at a glance.</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding:0 40px 40px; text-align:center;">
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="display:inline-block; padding:14px 36px; background:#FFD159; color:#0A0A0A; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">
          Go to Dashboard
        </a>
      </div>

      <!-- Divider -->
      <div style="margin:0 40px; border-top:1px solid #222;"></div>

      <!-- Footer -->
      <div style="padding:24px 40px; text-align:center;">
        <p style="margin:0 0 8px; color:#555; font-size:12px;">
          Need help getting started? Reach us at <a href="mailto:support@decavemgt.com" style="color:#FFD159; text-decoration:none;">support@decavemgt.com</a>
        </p>
        <p style="margin:0; color:#444; font-size:11px;">© ${new Date().getFullYear()} DeCave. All rights reserved.</p>
      </div>

    </div>
  </div>
  `;
};