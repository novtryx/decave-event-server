export function withdrawalRequestTemplate({
  user,
  amount,
  accountName,
  accountNumber,
  bankName,
  approveLink,
}: {
  user: { name: string };
  amount: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  approveLink: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; background:#0A0A0A; padding:40px;">
      <div style="max-width:600px; margin:auto; background:#151515; padding:30px; border-radius:12px;">
        
        <h2 style="color:#F9F7F4; margin-bottom:4px;">Withdrawal Request</h2>
        <p style="color:#888; margin-top:0;">A user has requested a payout. Please transfer manually then click the button below.</p>

        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:10px; padding:20px; margin:24px 0;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px;">User</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right;">${user.name}</td>
            </tr>
            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Amount</td>
              <td style="color:#FFD159; padding:8px 0; font-size:16px; font-weight:bold; text-align:right; border-top:1px solid #2a2a2a;">
                ₦${Number(amount).toLocaleString('en-NG')}
              </td>
            </tr>
            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Bank</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">${bankName}</td>
            </tr>
            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Account Number</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">${accountNumber}</td>
            </tr>
            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Account Name</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">${accountName}</td>
            </tr>
          </table>
        </div>

        <p style="color:#b3b3b3; font-size:13px;">
          Once you have made the transfer, click the button below to mark it as completed.
        </p>

        <a href="${approveLink}"
           style="display:inline-block; margin:16px 0; padding:14px 28px; background:#FFD159; color:#0A0A0A; border-radius:8px; text-decoration:none; font-weight:bold; font-size:15px;">
          ✅ Mark as Completed
        </a>

        <p style="color:#444; font-size:11px; margin-top:24px;">
          Do not click this link unless you have completed the transfer. This link is single-use.
        </p>
      </div>
    </div>
  `;
}