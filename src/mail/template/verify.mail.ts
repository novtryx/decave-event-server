import * as fs from 'fs';
import * as path from 'path';

const getLogo = (): string => {
  const buffer = fs.readFileSync(path.join(__dirname, 'decave-logo.png'));
  return `data:image/png;base64,${buffer.toString('base64')}`;
};

export const verifyEmailTemplate = ({ user, verifyLink }: { user: { name: string }, verifyLink: string }) => {
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
          <span style="font-size:32px;">✉️</span>
        </div>
        <h2 style="margin:0 0 12px; font-size:26px; font-weight:700; color:#F9F7F4;">Verify Your Email</h2>
        <p style="margin:0; color:#888; font-size:15px;">One last step before you get started.</p>
      </div>

      <!-- Body -->
      <div style="padding:0 40px 32px;">
        <p style="margin:0 0 16px; color:#F9F7F4; font-size:16px;">Hi <strong style="color:#FFD159;">${user.name}</strong>,</p>
        <p style="margin:0 0 16px; color:#888; font-size:14px; line-height:1.8;">
          Thanks for signing up on DeCave. Please verify your email address to activate your organiser account and start creating events.
        </p>
      </div>

      <!-- CTA -->
      <div style="padding:0 40px 40px; text-align:center;">
        <a href="${verifyLink}"
           style="display:inline-block; padding:14px 36px; background:#FFD159; color:#0A0A0A; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">
          Verify Email Address
        </a>
        <p style="margin:16px 0 0; color:#555; font-size:12px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>

      <!-- Divider -->
      <div style="margin:0 40px; border-top:1px solid #222;"></div>

      <!-- Footer -->
      <div style="padding:24px 40px; text-align:center;">
        <p style="margin:0 0 8px; color:#555; font-size:12px;">
          Need help? Contact <a href="mailto:support@decavemgt.com" style="color:#FFD159; text-decoration:none;">support@decavemgt.com</a>
        </p>
        <p style="margin:0; color:#444; font-size:11px;">© ${new Date().getFullYear()} DeCave. All rights reserved.</p>
      </div>

    </div>
  </div>
  `;
};