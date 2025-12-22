const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { query } = require("./db/db");
const redisClient = require("./config/redis");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

// Environment variables
const EMAIL_SERVICE_URL = "https://complete-authentication-system-ishj.onrender.com";
const FRONTEND_URL = "http://localhost:3000";
// OTP Configuration 
const OTP_CONFIG = {
    MAX_ATTEMPTS_PER_FLOW: 5,           // Maximum OTP requests allowed per flow (signup/login/reset)
    MAX_ATTEMPTS_PER_DAY: 10,            // Maximum OTP requests allowed in 24 hours
    COOLDOWN_SECONDS: 60,               // Seconds between OTP requests
    OTP_EXPIRY_SECONDS: 60,             // OTP validity duration (60 seconds)
    RESET_WINDOW_HOURS: 24,             // Time window for counting daily attempts
};

const googleClient = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "http://localhost:3000/api/auth/google/callback"
});

// Generate OTP (6-digit number)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP securely 
const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
};

// Verify OTP
const verifyOTP = async (otp, otpHash) => {
    return bcrypt.compare(otp, otpHash);
};

// ========================
// OTP RATE LIMITING UTILITY
// ========================

/**
 * Check if user can request OTP based on rate limits
 * @param {string} email - User's email
 * @param {string} flowType - Type of flow: 'signup', 'login', 'reset', 'resend'
 * @returns {Object} - Result with canRequest boolean and message if false
 */
const checkOTPRateLimit = async (email, flowType = 'signup') => {
    const flowKey = `otp_flow:${email}:${flowType}`;
    const dailyKey = `otp_daily:${email}`;

    // Check cooldown
    const cooldownActive = await redisClient.get(`otp_cooldown:${email}`);
    if (cooldownActive) {
        const ttl = await redisClient.ttl(`otp_cooldown:${email}`);
        return {
            canRequest: false,
            message: `Please wait ${ttl} seconds before requesting a new OTP.`,
            retryAfter: ttl
        };
    }

    // Check daily attempts
    const dailyCountStr = await redisClient.get(dailyKey);
    const dailyCount = dailyCountStr ? parseInt(dailyCountStr) : 0;

    if (dailyCount >= OTP_CONFIG.MAX_ATTEMPTS_PER_DAY) {
        const ttl = await redisClient.ttl(dailyKey);
        const hours = Math.ceil(ttl / 3600);
        return {
            canRequest: false,
            message: `Maximum daily OTP attempts (${OTP_CONFIG.MAX_ATTEMPTS_PER_DAY}) reached. Please try again in ${hours} hours.`,
            limitType: 'daily'
        };
    }

    // Check flow-specific attempts
    const flowCountStr = await redisClient.get(flowKey);
    const flowCount = flowCountStr ? parseInt(flowCountStr) : 0;

    if (flowCount >= OTP_CONFIG.MAX_ATTEMPTS_PER_FLOW) {
        return {
            canRequest: false,
            message: `Maximum OTP attempts (${OTP_CONFIG.MAX_ATTEMPTS_PER_FLOW}) reached for this verification. Please try a different method or contact support.`,
            limitType: 'flow'
        };
    }

    return { canRequest: true };
};

/**
 * Record OTP request for rate limiting
 * @param {string} email - User's email
 * @param {string} flowType - Type of flow: 'signup', 'login', 'reset', 'resend'
 */
const recordOTPRequest = async (email, flowType = 'signup') => {
    const flowKey = `otp_flow:${email}:${flowType}`;
    const dailyKey = `otp_daily:${email}`;

    // Set cooldown
    await redisClient.set(
        `otp_cooldown:${email}`,
        'true',
        { EX: OTP_CONFIG.COOLDOWN_SECONDS }
    );

    // Increment and set expiry for flow-specific counter (expires with OTP)
    const newFlowCount = await redisClient.incr(flowKey);
    if (newFlowCount === 1) {
        await redisClient.expire(flowKey, OTP_CONFIG.OTP_EXPIRY_SECONDS + 300); // OTP expiry + 5 min buffer
    }

    // Increment and set expiry for daily counter
    const newDailyCount = await redisClient.incr(dailyKey);
    if (newDailyCount === 1) {
        await redisClient.expire(
            dailyKey,
            OTP_CONFIG.RESET_WINDOW_HOURS * 60 * 60
        );
    }

    return {
        flowCount: newFlowCount,
        dailyCount: newDailyCount
    };
};

/**
 * Reset OTP counters after successful verification
 * @param {string} email - User's email
 */
const resetOTPCounters = async (email) => {
    // Remove all flow-specific counters
    const pattern = `otp_flow:${email}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
        await redisClient.del(keys);
    }

    // Remove cooldown
    await redisClient.del(`otp_cooldown:${email}`);



    return true;
};

// ========================
// GOOGLE AUTH ROUTES
// ========================

// Google OAuth initiation
router.get("/google", async (req, res) => {
    try {
        const state = uuidv4();
        const url = googleClient.generateAuthUrl({
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email"
            ],
            state,
            prompt: "consent",
            access_type: "offline"
        });

        res.json({
            success: true,
            authUrl: url
        });

    } catch (error) {
        console.error("Google OAuth error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate Google OAuth"
        });
    }
});

// Google OAuth callback
router.get("/google/callback", async (req, res) => {
    try {
        const { code } = req.query;

        // Exchange code for tokens
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        if (!tokens.id_token) {
            throw new Error("No id_token returned from Google");
        }

        // Verify ID token and extract user info
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name: full_name } = payload;

        // Check if user already exists
        const existingUsers = await query("SELECT * FROM users WHERE email = ?", [email]);
        let userId;

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];

            if (existingUser.auth_provider === "email") {
                return res.redirect(`${FRONTEND_URL}/auth/login?error=user_exists_with_email`);
            }

            userId = existingUser.user_id;
        } else {
            userId = uuidv4();
            await query(
                `INSERT INTO users 
                 (user_id, full_name, email, password, google_id, auth_provider, user_verified)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, full_name, email, '', google_id, 'google', 'true']
            );
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId, email, auth_provider: "google" },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Save refresh token in Redis
        await redisClient.set(
            `rt:${userId}:${refreshToken}`,
            'valid',
            { EX: 7 * 24 * 60 * 60 } // 7 days
        );

        // Set cookies and redirect
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const isNewUser = existingUsers.length === 0;
        const message = isNewUser ? 'Google signup successful!' : 'Google login successful!';
        const encodedMessage = encodeURIComponent(message);
        return res.redirect(`${FRONTEND_URL}/home?success=true&message=${encodedMessage}`);

    } catch (error) {
        console.error("Google OAuth Callback Error:", error.message);
        return res.redirect(`${FRONTEND_URL}/auth/login?error=google_auth_failed`);
    }
});

// ========================
// SIGNUP ROUTES
// ========================

// Signup - Send OTP
router.post("/signup/send-otp", async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // 1. Validate input
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // 2. Check if user already exists
        const existingUsers = await query(
            "SELECT user_id, auth_provider FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];

            if (existingUser.auth_provider === 'google') {
                return res.status(409).json({
                    success: false,
                    message: "User already exists with Google authentication. Please sign in with Google."
                });
            }

            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Check OTP rate limits for signup flow
        const rateLimitCheck = await checkOTPRateLimit(email, 'signup');
        if (!rateLimitCheck.canRequest) {
            return res.status(429).json({
                success: false,
                message: rateLimitCheck.message,
                limitType: rateLimitCheck.limitType,
                ...(rateLimitCheck.retryAfter && { retryAfter: rateLimitCheck.retryAfter })
            });
        }

        // 5. Generate OTP and hash it
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        // Store OTP in Redis
        await redisClient.set(`otp:${email}`, hashedOTP, { EX: OTP_CONFIG.OTP_EXPIRY_SECONDS });

        // Record OTP request for rate limiting
        const { flowCount, dailyCount } = await recordOTPRequest(email, 'signup');

        // 6. Create user (unverified initially)
        const userId = uuidv4();
        await query(
            `INSERT INTO users (
                user_id, full_name, email, password, 
                auth_provider, user_verified, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, full_name, email, hashedPassword,
                'email', 'false',
                new Date(), new Date()
            ]
        );

        // 7. Send OTP email
        axios.post(
            `${EMAIL_SERVICE_URL}/api/email/send-otp`,
            {
                to_email: email,
                otp: otp,
                full_name: full_name,
                type: "signup"
            }
        ).catch(error => {
            console.error("Background Email Error (Signup):", error.message);
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully. Please check your email.",
            userId: userId,
            attemptsUsed: flowCount,
            attemptsRemaining: OTP_CONFIG.MAX_ATTEMPTS_PER_FLOW - flowCount,
            dailyAttemptsUsed: dailyCount,
            dailyAttemptsRemaining: OTP_CONFIG.MAX_ATTEMPTS_PER_DAY - dailyCount
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Signup - Verify OTP
router.post("/signup/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // 2. Find user by email
        const users = await query(
            "SELECT user_id, full_name, user_verified FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        // 3. Check if already verified
        if (user.user_verified === true || user.user_verified === 'true') {
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            });
        }

        // 4. Check if OTP exists in Redis
        const storedHashedOTP = await redisClient.get(`otp:${email}`);

        if (!storedHashedOTP) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired or does not exist. Please request a new one."
            });
        }

        // 5. Verify OTP (hashed comparison)
        const isOTPValid = await verifyOTP(otp, storedHashedOTP);
        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // 6. OTP Valid - Invalidate immediately
        await redisClient.del(`otp:${email}`);

        // 7. Update user as verified
        await query(
            `UPDATE users SET 
                user_verified = 'true', 
                updated_at = ? 
            WHERE user_id = ?`,
            [new Date(), user.user_id]
        );

        // 8. Generate tokens
        const accessToken = jwt.sign(
            { userId: user.user_id, email: email, auth_provider: 'email' },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // 9. Store refresh token in Redis
        await redisClient.set(
            `rt:${user.user_id}:${refreshToken}`,
            'valid',
            { EX: 7 * 24 * 60 * 60 }
        );

        // 10. Reset OTP counters after successful verification
        await resetOTPCounters(email);

        // 11. Set cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Account verified successfully!"
        });

    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ========================
// LOGIN ROUTES
// ========================

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user with auth provider info
        const users = await query(
            "SELECT user_id, full_name, email, password, auth_provider, user_verified FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No account found with that email address"
            });
        }

        const user = users[0];

        // 3. Check authentication provider
        if (user.auth_provider === 'google') {
            return res.status(401).json({
                success: false,
                message: "This account uses Google authentication. Please click 'Sign in with Google'."
            });
        }

        // 4. Login Rate Limiting Check
        const isBlocked = await redisClient.get(`login_blocked:${email}`);
        if (isBlocked) {
            return res.status(429).json({
                success: false,
                message: "Too many login attempts. Please try again in 15 minutes."
            });
        }

        // 5. Check if verified
        if (user.user_verified !== 'true' && user.user_verified !== true) {
            // Check OTP rate limits for unverified user (login flow)
            const rateLimitCheck = await checkOTPRateLimit(email, 'login');
            if (!rateLimitCheck.canRequest) {
                return res.status(429).json({
                    success: false,
                    message: rateLimitCheck.message,
                    limitType: rateLimitCheck.limitType,
                    ...(rateLimitCheck.retryAfter && { retryAfter: rateLimitCheck.retryAfter })
                });
            }

            // Generate new OTP for unverified user
            const otp = generateOTP();
            const hashedOTP = await hashOTP(otp);

            // Store in Redis
            await redisClient.set(`otp:${email}`, hashedOTP, { EX: OTP_CONFIG.OTP_EXPIRY_SECONDS });

            // Record OTP request for login flow
            const { flowCount, dailyCount } = await recordOTPRequest(email, 'login');

            // Send OTP email (Background - don't await)
            axios.post(
                `${EMAIL_SERVICE_URL}/api/email/send-otp`,
                {
                    to_email: email,
                    otp: otp,
                    full_name: user.full_name,
                    type: "verification"
                }
            ).catch(error => {
                console.error("Background Email Error (Login/Unverified):", error.message);
            });

            return res.status(403).json({
                success: false,
                message: "Account not verified. A new OTP has been sent to your email.",
                attemptsUsed: flowCount,
                attemptsRemaining: OTP_CONFIG.MAX_ATTEMPTS_PER_FLOW - flowCount,
                dailyAttemptsUsed: dailyCount,
                dailyAttemptsRemaining: OTP_CONFIG.MAX_ATTEMPTS_PER_DAY - dailyCount
            });
        }

        // 6. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Increment failure count
            const failures = await redisClient.incr(`login_failures:${email}`);
            if (failures === 1) {
                await redisClient.expire(`login_failures:${email}`, 15 * 60); // 15 min window
            }

            if (failures >= 5) {
                await redisClient.set(`login_blocked:${email}`, 'true', { EX: 15 * 60 });
                return res.status(429).json({
                    success: false,
                    message: "Too many login attempts. Please try again in 15 minutes."
                });
            }

            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        // Login Successful - Reset failure count
        await redisClient.del(`login_failures:${email}`);
        await redisClient.del(`login_blocked:${email}`);

        // 7. Generate tokens
        const accessToken = jwt.sign(
            { userId: user.user_id, email: user.email, auth_provider: 'email' },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // 8. Store refresh token in Redis
        await redisClient.set(
            `rt:${user.user_id}:${refreshToken}`,
            'valid',
            { EX: 7 * 24 * 60 * 60 }
        );

        // 9. Set cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 10. Send success response
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                auth_provider: user.auth_provider
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, please try again later"
        });
    }
});

// ========================
// PASSWORD RESET ROUTES
// ========================

// Forgot password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Check if email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // 2. Find user in database
        const users = await query(
            "SELECT user_id, full_name, email, auth_provider FROM users WHERE email = ?",
            [email]
        );

        // 3. Check if user exists
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found with this email"
            });
        }

        const user = users[0];

        // 4. Check if user is Google user
        if (user.auth_provider === 'google') {
            return res.status(400).json({
                success: false,
                message: "Google users cannot reset password. Please sign in with Google."
            });
        }

        // 5. Check if user has password (email provider)
        if (user.auth_provider === 'email') {
            const userWithPassword = await query(
                "SELECT user_id FROM users WHERE email = ? AND password IS NOT NULL",
                [email]
            );

            if (userWithPassword.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "This account doesn't have a password. Please use Google login or contact support."
                });
            }
        }

        // 6. Check OTP rate limits for reset flow
        const rateLimitCheck = await checkOTPRateLimit(email, 'reset');
        if (!rateLimitCheck.canRequest) {
            return res.status(429).json({
                success: false,
                message: rateLimitCheck.message,
                limitType: rateLimitCheck.limitType,
                ...(rateLimitCheck.retryAfter && { retryAfter: rateLimitCheck.retryAfter })
            });
        }

        // 7. Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // 8. Save reset token to database
        const resetTokenId = uuidv4();
        await query(
            "INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
            [
                resetTokenId,
                user.user_id,
                resetToken,
                new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
                new Date()
            ]
        );

        // 9. Record OTP request for rate limiting (reset flow)
        await recordOTPRequest(email, 'reset');

        // 10. Send reset email using Email Service (Background - don't await)
        axios.post(
            `${EMAIL_SERVICE_URL}/api/email/send-reset`,
            {
                to_email: email,
                reset_url: `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`,
                full_name: user.full_name
            }
        ).catch(error => {
            console.error("Background Email Error (Forgot Password):", error.message);
        });

        res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email."
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
});

// Validate reset token
router.get("/validate-reset-token", async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is required"
            });
        }

        // 1. Verify token signature
        try {
            jwt.verify(token, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: "Invalid or expired token signature"
            });
        }

        // 2. Check database
        const tokens = await query(
            "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ? AND used = 'false'",
            [token, new Date()]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: "Token not found, expired, or already used"
            });
        }

        // Token is valid
        res.status(200).json({
            success: true,
            valid: true,
            message: "Token is valid"
        });

    } catch (error) {
        console.error("Validate reset token error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Reset password - UPDATE PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // 1. Validate input
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_RESET_SECRET || process.env.JWT_SECRET
        );

        // 3. Check if token exists in database and is not expired/used
        const tokens = await query(
            "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ? AND used = 'false'",
            [token, new Date()]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid, expired, or already used reset token"
            });
        }

        const resetToken = tokens[0];

        // 4. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update user password
        await query(
            "UPDATE users SET password = ?, updated_at = ? WHERE user_id = ?",
            [hashedPassword, new Date(), resetToken.user_id]
        );

        // 6. Mark reset token as used
        await query(
            "UPDATE password_reset_tokens SET used = 'true', used_at = ? WHERE id = ?",
            [new Date(), resetToken.id]
        );

        // 7. Delete all refresh tokens for user from Redis
        try {
            const iterator = redisClient.scanIterator({
                MATCH: `rt:${resetToken.user_id}:*`,
                COUNT: 100
            });

            const keys = [];
            for await (const key of iterator) {
                keys.push(key);
            }

            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } catch (redisError) {
            console.error("Redis clear sessions error:", redisError.message);
        }

        // 8. Reset OTP counters after successful password reset
        await resetOTPCounters(decoded.email);

        // 9. Send success response
        res.status(200).json({
            success: true,
            message: "Password reset successful! Please login with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        // Handle JWT errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ========================
// OTHER AUTH ROUTES
// ========================

// Logout
router.post("/logout", async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const accessToken = req.cookies.accessToken;

        // 1. Clear refresh token from Redis
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                await redisClient.del(`rt:${decoded.userId}:${refreshToken}`);
            } catch (err) {
                // Ignore expired tokens
            }
        }

        // 2. Blacklist Access Token (Prevent reuse)
        if (accessToken) {
            try {
                const decoded = jwt.decode(accessToken);
                if (decoded) {
                    const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
                    if (timeLeft > 0) {
                        await redisClient.set(`bl_token:${accessToken}`, 'true', { EX: timeLeft });
                    }
                }
            } catch (err) {
                // Ignore
            }
        }

        // 3. Clear cookies
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        // 4. Send success response
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
});

// Refresh token
router.post("/refresh-token", async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // 1. Check if refresh token exists
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Session has expired, please log in again" });
        }

        // 2. Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }

        // 3. Check if token exists in Redis whitelist
        const isValid = await redisClient.get(`rt:${decoded.userId}:${refreshToken}`);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Session expired or invalid" });
        }

        // 4. Get user information
        const users = await query(
            "SELECT user_id, email, auth_provider FROM users WHERE user_id = ?",
            [decoded.userId]
        );

        if (!users.length) {
            return res.status(401).json({ success: false });
        }

        const user = users[0];

        // 5. Issue new access token
        const newAccessToken = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                auth_provider: user.auth_provider
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // 6. Set new access token cookie
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        // 7. Send success response
        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(401).json({ success: false });
    }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // 2. Find user
        const users = await query(
            "SELECT user_id, full_name, auth_provider, user_verified FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please sign up."
            });
        }

        const user = users[0];

        // 3. Check if user is using Google auth
        if (user.auth_provider === 'google') {
            return res.status(400).json({
                success: false,
                message: "This account uses Google authentication. Please sign in with Google."
            });
        }

        // 4. Check if already verified
        if (user.user_verified === 'true' || user.user_verified === true) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified",
                isVerified: true
            });
        }

        // 5. Check OTP rate limits for resend flow
        const rateLimitCheck = await checkOTPRateLimit(email, 'resend');
        if (!rateLimitCheck.canRequest) {
            return res.status(429).json({
                success: false,
                message: rateLimitCheck.message,
                limitType: rateLimitCheck.limitType,
                ...(rateLimitCheck.retryAfter && { retryAfter: rateLimitCheck.retryAfter })
            });
        }

        // 6. Generate new OTP
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        // Store in Redis
        await redisClient.set(`otp:${email}`, hashedOTP, { EX: OTP_CONFIG.OTP_EXPIRY_SECONDS });

        // Record OTP request for resend flow
        const { flowCount, dailyCount } = await recordOTPRequest(email, 'resend');

        // 7. Update User (Only updated_at for logging)
        await query(
            `UPDATE users SET updated_at = ? WHERE user_id = ?`,
            [new Date(), user.user_id]
        );

        // 8. Send OTP email
        try {
            await axios.post(
                `${EMAIL_SERVICE_URL}/api/email/send-otp`,
                {
                    to_email: email,
                    otp: otp,
                    full_name: user.full_name,
                    type: "signup"
                }
            );

            res.status(200).json({
                success: true,
                message: "New OTP sent successfully!",
                attemptsUsed: flowCount,
                attemptsRemaining: OTP_CONFIG.MAX_ATTEMPTS_PER_FLOW - flowCount,
                dailyAttemptsUsed: dailyCount,
                dailyAttemptsRemaining: OTP_CONFIG.MAX_ATTEMPTS_PER_DAY - dailyCount
            });

        } catch (emailError) {
            console.error("Email service error:", emailError);
            res.status(500).json({
                success: false,
                message: "Failed to send OTP email. Please try again."
            });
        }

    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Validate session
router.get("/validate-session", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        // 1. Try to validate access token
        if (accessToken) {
            try {
                // Check blacklist first
                const isBlacklisted = await redisClient.get(`bl_token:${accessToken}`);
                if (isBlacklisted) throw new Error("Blacklisted token");

                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                const users = await query(
                    "SELECT user_id, full_name, email, auth_provider, user_verified FROM users WHERE user_id = ?",
                    [decoded.userId]
                );

                if (users.length && (users[0].user_verified === 'true' || users[0].user_verified === true)) {
                    return res.json({ success: true, user: users[0] });
                }
            } catch (err) {
                // Access token is invalid, continue to refresh token
            }
        }

        // 2. If no refresh token, session is invalid
        if (!refreshToken) return res.status(401).json({ success: false, message: "Session has expired, please log in again" });

        // 3. Verify refresh token
        let decodedRefresh;
        try {
            decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false });
        }

        // Check Redis whitelist
        const isRtValid = await redisClient.get(`rt:${decodedRefresh.userId}:${refreshToken}`);
        if (!isRtValid) return res.status(401).json({ success: false });

        // 4. Get user information
        const users = await query(
            "SELECT user_id, full_name, email, auth_provider, user_verified FROM users WHERE user_id = ?",
            [decodedRefresh.userId]
        );

        if (!users.length || (users[0].user_verified !== 'true' && users[0].user_verified !== true)) {
            return res.status(401).json({ success: false });
        }

        const user = users[0];

        // 5. Generate new access token
        const newAccessToken = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                auth_provider: user.auth_provider
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // 6. Set new access token cookie
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        // 7. Send success response with user data
        res.json({ success: true, user: user });

    } catch (error) {
        console.error("Validate session error:", error);
        res.status(401).json({ success: false });
    }
});

// Get current user
router.get("/me", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;

        // 1. Check if access token exists
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Verify access token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        // 3. Get user information
        const users = await query(
            "SELECT user_id, full_name, email, auth_provider, created_at FROM users WHERE user_id = ?",
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        // 4. Send user data
        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                auth_provider: user.auth_provider,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Export the router
module.exports = router;