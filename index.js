require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "https://its-power-frontend.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer
const upload = multer({ dest: "uploads/" });

/* ============================
      SEND CAREER FORM
===============================*/
app.post("/send-career", upload.single("resume"), async (req, res) => {
  const { fullname, email, phone, education, experience, location, message } = req.body;
  const resumePath = req.file.path;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: "sales@itspowerinfra.com",
    subject: `New Job Application from ${fullname}`,
    html: `
      <h3>New Job Application</h3>
      <p><strong>Name:</strong> ${fullname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Education:</strong> ${education}</p>
      <p><strong>Experience:</strong> ${experience} years</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
    attachments: [
      {
        filename: req.file.originalname,
        path: resumePath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================
      SEND CONTACT FORM
===============================*/
app.post("/send-contact", async (req, res) => {
  const { name, company, phone, email, product, city, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: "sales@itspowerinfra.com",
    subject: `New Contact Inquiry from ${name}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Product:</strong> ${product}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message Sent Successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================
       SERVER START
===============================*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
