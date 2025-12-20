require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");

const app = express();

/* CORS */
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);


/* Multer BEFORE body parser */
/* Multer BEFORE body parser (FIXED) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Only PDF or Word files allowed"));
    } else {
      cb(null, true);
    }
  },
});


/* Body parser */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* SMTP Transport */
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Resume file is required",
      });
    }

    const {
      fullname,
      email,
      phone,
      education,
      experience,
      location,
      message,
    } = req.body;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "suresh@itspowerinfra.com",
      subject: `New Job Application - ${fullname}`,
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
          contentType: req.file.mimetype,
        },
      ],
    });

    res.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (err) {
    console.error("CAREER ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

/* CONTACT ROUTE */
app.post("/send-contact", async (req, res) => {
  try {
    const { name, company, phone, email, product, city, message } = req.body;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "suresh@itspowerinfra.com",
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
      `,
    });

    res.json({ success: true, message: "Message Sent Successfully!" });
  } catch (err) {
    console.log("CONTACT EMAIL ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
