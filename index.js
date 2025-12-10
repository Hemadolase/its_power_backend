require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");

const app = express();

/* CORS */
app.use(
  cors({
    origin: "https://its-power-frontend.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.options("*", cors());

/* IMPORTANT: Disable default parser so multer can read file */
app.use(express.json({ limit: "0" }));
app.use(express.urlencoded({ extended: true, limit: "0" }));

/* Multer (MUST come before routes) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* Email transporter */
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

/* CAREER ROUTE */
app.post("/send-career", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, error: "Resume required" });

    const { fullname, email, phone, education, experience, location, message } =
      req.body;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: email || process.env.GMAIL_USER,
      to: "sales@itspowerinfra.com",
      subject: `New Job Application from ${fullname}`,
      html: `
        <h3>New Job Application</h3>
        <p><strong>Name:</strong> ${fullname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Education:</strong> ${education}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ],
    });

    return res.json({ success: true, message: "Application Sent Successfully!" });
  } catch (err) {
    console.log("CAREER EMAIL ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* CONTACT FORM */
app.post("/send-contact", async (req, res) => {
  try {
    const { name, company, phone, email, product, city, message } = req.body;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: email || process.env.GMAIL_USER,
      to: "sales@itspowerinfra.com",
      subject: `New Contact Inquiry from ${name}`,
      html: `
        <h3>Contact Inquiry</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Product:</strong> ${product}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    return res.json({ success: true, message: "Message Sent Successfully!" });
  } catch (err) {
    console.log("CONTACT EMAIL ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
