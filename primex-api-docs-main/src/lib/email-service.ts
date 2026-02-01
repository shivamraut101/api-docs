import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  react?: React.ReactNode;
}

export async function sendEmail({ to, subject, text, react }: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "re_123456789") {
    console.log("----------------------------------------------------");
    console.log(`[MOCK EMAIL SERVICE] Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:`);
    console.log(text);
    console.log("----------------------------------------------------");
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Primexmeta <no-reply@primexmeta.com>",
      to,
      subject,
      text,
      react: react as React.ReactElement,
    });

    if (error) {
      console.error("Resend Error Details:", JSON.stringify(error, null, 2));
      return false;
    }

    console.log("Email sent successfully. ID:", data?.id);
    return true;
  } catch (err) {
    console.error("Email Service Exception:", err);
    return false;
  }
}
