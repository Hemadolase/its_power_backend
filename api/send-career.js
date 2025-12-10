import nodemailer from "nodemailer";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await runMiddleware(req, res, upload.single("resume"));

  try {
    const { fullname, email, phone, education, experience, location, message } = req.body;

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
      subject: `New Job Application from ${fullname}`,
      html: `
        <h3>New Job Application</h3>
        <p><b>Name:</b> ${fullname}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Education:</b> ${education}</p>
        <p><b>Experience:</b> ${experience}</p>
        <p><b>Location:</b> ${location}</p>
        <p><b>Message:</b><br>${message}</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ],
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.log("CAREER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
