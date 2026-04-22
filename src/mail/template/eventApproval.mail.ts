export function eventApprovalTemplate({
  event,
  organizer,
  approveLink,
}: {
  event: {
    title: string;
    type: string;
    eventDate: Date;
    venue: string;
    address: string;
  };
  organizer: {
    name: string;
    email: string;
    businessName?: string;
  };
  approveLink: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; background:#0A0A0A; padding:40px;">
      <div style="max-width:600px; margin:auto; background:#151515; padding:30px; border-radius:12px;">
        
        <h2 style="color:#F9F7F4; margin-bottom:4px;">Event Approval Request</h2>
        <p style="color:#888; margin-top:0;">
          A new event has been created and is awaiting your approval.
        </p>

        <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:10px; padding:20px; margin:24px 0;">
          <table style="width:100%; border-collapse:collapse;">

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px;">Event Title</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right;">
                ${event.title}
              </td>
            </tr>

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Type</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">
                ${event.type}
              </td>
            </tr>

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Date</td>
              <td style="color:#FFD159; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">
                ${new Date(event.eventDate).toLocaleString()}
              </td>
            </tr>

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Venue</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">
                ${event.venue}
              </td>
            </tr>

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Address</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">
                ${event.address}
              </td>
            </tr>

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Organizer</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">
                ${organizer.name}
              </td>
            </tr>

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Email</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">
                ${organizer.email}
              </td>
            </tr>

            <tr>
              <td style="color:#888; padding:8px 0; font-size:13px; border-top:1px solid #2a2a2a;">Business</td>
              <td style="color:#f0f0f0; padding:8px 0; font-size:13px; text-align:right; border-top:1px solid #2a2a2a;">
                ${organizer.businessName ?? 'N/A'}
              </td>
            </tr>

          </table>
        </div>

        <p style="color:#b3b3b3; font-size:13px;">
          Review the event details carefully. Click the button below to approve this event.
        </p>

        <a href="${approveLink}"
           style="display:inline-block; margin:16px 0; padding:14px 28px; background:#FFD159; color:#0A0A0A; border-radius:8px; text-decoration:none; font-weight:bold; font-size:15px;">
          ✅ Approve Event
        </a>

        <p style="color:#444; font-size:11px; margin-top:24px;">
          Only click this button if you have verified the event. This action may be irreversible.
        </p>
      </div>
    </div>
  `;
}
