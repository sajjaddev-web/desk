import * as nodemailer from "nodemailer";

export const sendActiveAppEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    // Configure your email service
    service: "gmail", // Example using Gmail
    auth: {
      user: process.env.Email,
      pass: process.env.EmailPass,
    },
  });

  const resetLink = `${process.env.API_URL}/auth/activation?token=${token}`;

  await transporter.sendMail({
    from: "mrsajjadcode@gmail.com",
    to: email,
    subject: "فعالسازی برنامه در desk",
    text: `شما میتوانید با کلیک روی این لینک برنامه خود را اکتیو کنید : ${resetLink}`,
  });
};
