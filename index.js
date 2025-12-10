require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");

const app = express();

/* CORS: allow only your frontend domain (safer) */
app.use(
  cors({
    origin: "https://its-power-frontend.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Multer in-memory storage (no uploads/ folder required on Render) */
const upload = multer({ storage: multer.memoryStorage() });

/* Helper: create transporter once (optional optimization) */
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // 16-digit app password
    },
  });
}


/* ============================
   SEND CAREER FORM (with file)
   ============================ */
app.post("/send-career", upload.single("resume"), async (req, res) => {
  try {
    // Basic validation
    if (!req.file) return res.status(400).json({ success: false, error: "Resume is required" });

    const { fullname, email, phone, education, experience, location, message } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: email || process.env.GMAIL_USER,
      to: "sales@itspowerinfra.com",
      subject: `New Job Application from ${fullname || "Unknown"}`,
      html: `
        <h3>New Job Application</h3>
        <p><strong>Name:</strong> ${fullname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Education:</strong> ${education}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Application Sent!" });
  } catch (err) {
    console.log("CAREER EMAIL ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================
   SEND CONTACT FORM
   ============================ */
app.post("/send-contact", async (req, res) => {
  try {
    const { name, company, phone, email, product, city, message } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: email || process.env.GMAIL_USER,
      to: "sales@itspowerinfra.com",
      subject: `New Contact Inquiry from ${name || "Website"}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Product:</strong> ${product}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Message Sent Successfully!" });
  } catch (err) {
    console.log("CONTACT EMAIL ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================
   START SERVER
   ============================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
