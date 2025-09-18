// utils/sendEmail.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, subject, message }) => {
  try {
    const response = await resend.emails.send({
      from: 'Your App <onboarding@resend.dev>',  // can change to your domain email later
      to: email,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    console.log("Resend email response:", response);
    return response;
  } catch (error) {
    console.error("Resend email error:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
