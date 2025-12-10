import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, company, phone, email, product, city, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "sales@itspowerinfra.com",
      subject: `New Contact Inquiry from ${name}`,
      html: `
        <h3>Contact Inquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Company:</b> ${company}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Product:</b> ${product}</p>
        <p><b>City:</b> ${city}</p>
        <p><b>Message:</b><br>${message}</p>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.log("CONTACT ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
