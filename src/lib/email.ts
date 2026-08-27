import { Resend } from 'resend';

// Initialize Resend client if API key is provided
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log(`[Email Fallback] To: ${to} | Subject: ${subject}`);
    console.log(`[Email Fallback] Body preview: ${html.substring(0, 150)}...`);
    return { id: `fallback-${Date.now()}`, success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Aartha <notifications@aartha.site>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { id: `error-${Date.now()}`, success: false };
    }

    return { id: data?.id, success: true };
  } catch (err) {
    console.error('[Email] Send failed:', err);
    return { id: `error-${Date.now()}`, success: false };
  }
}
