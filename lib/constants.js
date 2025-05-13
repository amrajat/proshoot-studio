export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export const getEmailFrom = () => {
  return process.env.DEFAULT_FROM_EMAIL || "noreply@proshoot.co";
};

export const getEmailName = () => {
  return process.env.DEFAULT_FROM_NAME || "Headsshot";
};

export const getEmailSubject = () => {
  return process.env.EMAIL_SUBJECT || "Headsshot Invitation";
};

export const getEmailBody = () => {
  return process.env.EMAIL_BODY || "You are invited to join Headsshot";
};

export const getEmailTextBody = () => {
  return process.env.EMAIL_TEXT_BODY || "You are invited to join Headsshot";
};
