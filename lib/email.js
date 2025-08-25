"use server";
import { SendMailClient } from "zeptomail";

if (!process.env.ZEPTOMAIL_API_URL || !process.env.ZEPTOMAIL_SENDMAIL_TOKEN) {
  console.warn(
    "ZeptoMail environment variables (ZEPTOMAIL_API_URL, ZEPTOMAIL_SENDMAIL_TOKEN) are not set. Email sending will be disabled."
  );
}

const client = new SendMailClient({
  url: process.env.ZEPTOMAIL_API_URL,
  token: process.env.ZEPTOMAIL_SENDMAIL_TOKEN,
});

// Branding & defaults
const BRAND_NAME = "Proshoot";
const BRAND_EMAIL = "no-reply@proshoot.co";
const BRAND_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://proshoot.co";
const BRAND_LOGO = `${BRAND_URL}/favicon.ico`;

const stripHtml = (html) =>
  html
    ?.replace(/\n+/g, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim() || "";

// Base responsive HTML email template with inline-safe styles
const renderEmailTemplate = ({
  subject = "",
  preheader = "",
  contentHtml = "",
  footerHtml = "",
}) => {
  const safePreheader = (preheader || subject || BRAND_NAME).slice(0, 140);
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="x-apple-disable-message-reformatting" />
      <title>${subject}</title>
      <style>
        /* Clients that support <style> will use these; we still inline critical styles below */
        @media (max-width: 600px) {
          .container { width: 100% !important; padding: 0 16px !important; }
          .card { padding: 20px !important; }
          .h1 { font-size: 22px !important; }
          .btn { display: block !important; width: 100% !important; }
        }
        a { color: #2563eb; text-decoration: none; }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f6f7f9;color:#0f172a;">
      <!-- Preheader (hidden in most clients) -->
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        ${safePreheader}
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7f9;">
        <tr>
          <td align="center" style="padding: 32px 12px;">
            <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
              <!-- Header -->
              <tr>
                <td style="padding: 20px 24px; background: #0f172a; color: #ffffff;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td align="left" style="vertical-align:middle;">
                        <a href="${BRAND_URL}" style="display:inline-flex;align-items:center;gap:8px;color:#fff;">
                          <img src="${BRAND_LOGO}" alt="${BRAND_NAME}" width="24" height="24" style="display:inline-block;border-radius:4px;" />
                          <span style="font-weight:700;font-size:16px;letter-spacing:.2px;">${BRAND_NAME}</span>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content card -->
              <tr>
                <td class="card" style="padding: 28px 28px 8px 28px;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 28px 28px 28px;">
                  ${
                    footerHtml ||
                    `<p style="margin:0;color:#64748b;font-size:12px;line-height:18px;">
                      You’re receiving this because you have an account at <a href="${BRAND_URL}" style="color:#2563eb;">${BRAND_NAME}</a>.
                    </p>
                    <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>`
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

export const sendTransactionalEmail = async (
  to,
  subject,
  htmlBody,
  textBody
) => {
  const fromAddress = BRAND_EMAIL;
  const fromName = BRAND_NAME;

  // Wrap provided body in our branded template
  const wrappedHtml = renderEmailTemplate({
    subject,
    preheader: stripHtml(htmlBody)?.slice(0, 140),
    contentHtml: htmlBody,
  });
  const fallbackText = textBody || stripHtml(htmlBody);

  try {
    const response = await client.sendMail({
      from: {
        address: fromAddress,
        name: fromName,
      },
      to: to,
      subject: subject,
      htmlbody: wrappedHtml,
      textbody: fallbackText,
      track_clicks: true,
      track_opens: true,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to send email.",
    };
  }
};

export const sendOrganizationInviteEmail = async (params) => {
  const { to, inviterName, organizationName, inviteUrl } = params;
  const subject = `You're invited to join ${organizationName} on Proshoot`;
  const htmlBody = `
    <h1 class="h1" style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#0f172a;">You're Invited!</h1>
    <p style="margin:0 0 12px;color:#334155;font-size:14px;">Hi there,</p>
    <p style="margin:0 0 12px;color:#334155;font-size:14px;">
      <strong>${inviterName}</strong> has invited you to join the
      <strong>${organizationName}</strong> organization on ${BRAND_NAME}.
    </p>
    <p style="margin:0 0 16px;color:#334155;font-size:14px;">Click the button below to accept the invitation and get started:</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a class="btn" href="${inviteUrl}" target="_blank" rel="noopener" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 18px;border-radius:10px;font-weight:600;font-size:14px;">
            Accept Invitation
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0;color:#64748b;font-size:12px;">If you didn’t expect this invitation, you can safely ignore this email.</p>
  `;

  return sendTransactionalEmail(
    [{ email_address: { address: to } }],
    subject,
    htmlBody,
    // text fallback
    `You're invited to join ${organizationName} on ${BRAND_NAME}. Visit: ${inviteUrl}`
  );
};
