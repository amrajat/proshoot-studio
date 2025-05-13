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
