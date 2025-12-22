const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Load env
dotenv.config();

// Redis connection 
require("./config/redis");

// Routes
const authRoutes = require("./authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   CORS CONFIGURATION
   =============================== */
const allowedOrigins = [
    "https://authenticationsystem-ten.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        credentials: true
    })
);


/* ===============================
   MIDDLEWARE
   =============================== */
app.use(express.json());
app.use(cookieParser());

/* ===============================
   ROUTES
   =============================== */
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.status(200).send("AuthService is running");
});

/* ===============================
   START SERVER (RENDER)
   =============================== */
app.listen(PORT, () => {
    console.log(`AuthService running on port ${PORT}`);
});
