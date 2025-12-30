const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { query } = require("./db/db");
const templates = require("./templates");
const { Resend } = require("resend");

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const allowedOrigins = [
    "https://authenticationsystem-ten.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        credentials: true
    })
);
app.use(express.json());

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to log email to database (non-blocking)
const logEmail = (emailData) => {
    query(
        "INSERT INTO email_logs (id, to_email, subject, otp, type, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            uuidv4(),
            emailData.to_email,
            emailData.subject,
            emailData.otp || null,
            emailData.type || 'signup',
            'sent',
            new Date()
        ]
    ).catch(error => console.error("Failed to log email:", error));
};

// Email routes
app.post("/api/email/send-otp", async (req, res) => {
    try {
        const { to_email, otp, full_name, type = "signup" } = req.body;

        if (!to_email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // Use template
        const htmlTemplate = templates.otpEmail({
            full_name,
            otp
        });

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: to_email,
            subject: "Your Verification Code - SecureApp",
            html: htmlTemplate,
        });

        if (error) {
            throw new Error(error.message);
        }

        // Log the email to database (background)
        logEmail({
            to_email,
            subject: "Your Verification Code",
            otp,
            type
        });

        res.json({
            success: true,
            message: "OTP email sent successfully",
            data: data
        });

    } catch (error) {
        console.error("Send OTP error:", error);

        // Try to log failed email attempt (background)
        query(
            "INSERT INTO email_logs (id, to_email, subject, otp, type, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                uuidv4(),
                req.body.to_email,
                "Your Verification Code",
                req.body.otp || null,
                req.body.type || 'signup',
                'failed',
                new Date()
            ]
        ).catch(logError => console.error("Failed to log error:", logError));

        res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message
        });
    }
});

app.post("/api/email/send-reset", async (req, res) => {
    try {
        const { to_email, reset_url, full_name } = req.body;

        if (!to_email || !reset_url) {
            return res.status(400).json({
                success: false,
                message: "Email and reset URL are required"
            });
        }

        // Use template
        const htmlTemplate = templates.resetPasswordEmail({
            full_name,
            reset_url
        });

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: to_email,
            subject: "Reset Your Password - SecureApp",
            html: htmlTemplate,
        });

        if (error) {
             throw new Error(error.message);
        }

        // Log the email to database (background)
        logEmail({
            to_email,
            subject: "Password Reset Request",
            type: 'reset_password'
        });

        res.json({
            success: true,
            message: "Reset email sent successfully",
            data: data
        });

    } catch (error) {
        console.error("Send reset email error:", error);

        // Try to log failed email attempt (background)
        query(
            "INSERT INTO email_logs (id, to_email, subject, type, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)",
            [
                uuidv4(),
                req.body.to_email,
                "Password Reset Request",
                'reset_password',
                'failed',
                new Date()
            ]
        ).catch(logError => console.error("Failed to log error:", logError));

        res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message
        });
    }
});

app.get("/", (req, res) => {
    res.send("EmailService (Resend) is running...");
});

app.listen(port, () => {
    console.log(`EmailService running on port ${port}`);
});