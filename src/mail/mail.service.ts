// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { generateTicketPDF, ticketEmailTemplate } from './template/ticket.mail';
import { welcomeEmailTemplate } from './template/welcome.mail';
import { verifyEmailTemplate } from './template/verify.mail';
import { withdrawalRequestTemplate } from './template/withdrawal.mail';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendTicketEmail({ buyer, event, ticket, transaction }: any) {
    const pdfBuffer = await generateTicketPDF({ buyer, event, ticket, transaction });
    const html = ticketEmailTemplate({ buyer, event, ticket, transaction });

    await this.transporter.sendMail({
      from: '"DeCave" <info@decavemgt.com>',
      to: buyer.email,
      subject: `Your Ticket for ${event.eventTheme} 🎫`,
      html,
      attachments: [
        {
          filename: `ticket-${buyer.ticketId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendWelcomeEmail({ user }: { user: { name: string; email: string } }) {
  await this.transporter.sendMail({
    from: '"DeCave" <info@decavemgt.com>',
    to: user.email,
    subject: `Welcome to DeCave 🎉`,
    html: welcomeEmailTemplate({ user }),
  });
}

async sendVerificationEmail({ user, verifyToken }: { user: { name: string; email: string }, verifyToken: string }) {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

  await this.transporter.sendMail({
    from: '"DeCave" <info@decavemgt.com>',
    to: user.email,
    subject: 'Verify Your Email Address',
    html: verifyEmailTemplate({ user, verifyLink }),
  });
}
async sendVerifyWithdrawalEmail({user, amount, accountName, accountNumber, bankName, approveLink}: any){
  await this.transporter.sendMail({
       from: '"DeCave" <info@decavemgt.com>',
       to: process.env.ADMIN_EMAIL,
       subject: `💸 Withdrawal Request — ₦${amount.toLocaleString('en-NG')} from ${user.name}`,
       html: withdrawalRequestTemplate({
         user,
         amount,
         accountName,
         accountNumber,
         bankName,
         approveLink,
       }),
     });

}

  async sendResetPasswordEmail({ email, name, resetLink }: any) {
  await this.transporter.sendMail({
    from: '"DeCave Security" <info@decavemgt.com>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; background:#0A0A0A; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#151515; padding:30px; border-radius:12px;">
          <h2 style="color:#F9F7F4;">Hi ${name},</h2>
          <p style="color:#b3b3b3;">You requested a password reset. Click the button below to reset your password. This link expires in 30 minutes.</p>
          <a href="${resetLink}" 
             style="display:inline-block; margin:20px 0; padding:12px 24px; background:#CCA33A; color:#0A0A0A; border-radius:6px; text-decoration:none; font-weight:bold;">
            Reset Password
          </a>
          <p style="color:#666; font-size:12px;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  });
}
}