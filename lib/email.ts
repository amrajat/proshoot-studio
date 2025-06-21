import { SendMailClient } from "zeptomail";

const url = process.env.ZEPTOMAIL_API_URL;
const token = process.env.ZEPTOMAIL_SENDMAIL_TOKEN;

if (!url || !token) {
  console.warn(
    "ZeptoMail environment variables (ZEPTOMAIL_API_URL, ZEPTOMAIL_SENDMAIL_TOKEN) are not set. Email sending will be disabled."
  );
}

// Initialize client only if credentials are available
const client = url && token ? new SendMailClient({ url, token }) : null;

interface EmailRecipient {
  email_address: {
    address: string;
    name?: string;
  };
}

export const sendTransactionalEmail = async (
  to: EmailRecipient[],
  subject: string,
  htmlBody: string,
  textBody?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!client) {
    console.error("ZeptoMail client not initialized. Cannot send email.");
    return { success: false, error: "Email client not configured." };
  }

  // Ensure your default 'from' address is verified in ZeptoMail
  const fromAddress = process.env.DEFAULT_FROM_EMAIL || "noreply@proshoot.co";
  const fromName = process.env.DEFAULT_FROM_NAME || "Headsshot";

  try {
    const response = await client.sendMail({
      from: {
        address: fromAddress,
        name: fromName,
      },
      to: to,
      subject: subject,
      htmlbody: htmlBody,
      textbody: textBody, // Optional text version
      track_clicks: true, // Optional: configure as needed
      track_opens: true, // Optional: configure as needed
    });
    // ZeptoMail client might not throw an error but return a status in response
    // Check the actual response structure from zeptomail documentation if needed
    console.log("ZeptoMail send response:", response);
    // Assuming success if no error is thrown, adjust based on actual API response if necessary
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email via ZeptoMail:", error);
    return {
      success: false,
      error: error.message || "Failed to send email.",
    };
  }
};

interface OrgInviteParams {
  to: string;
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
}

export const sendOrganizationInviteEmail = async (params: OrgInviteParams) => {
  const { to, inviterName, organizationName, inviteUrl } = params;
  const subject = `You're invited to join ${organizationName} on Headsshot`;
  const htmlBody = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>You're Invited!</h2>
      <p>Hi there,</p>
      <p>
        <strong>${inviterName}</strong> has invited you to join the
        <strong>${organizationName}</strong> organization on Headsshot.
      </p>
      <p>Click the button below to accept the invitation and get started:</p>
      <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Accept Invitation
      </a>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 0.8em; color: #777;">
        This email was sent from Headsshot.
      </p>
    </div>
  `;

  return sendTransactionalEmail(
    [{ email_address: { address: to } }],
    subject,
    htmlBody
  );
};
