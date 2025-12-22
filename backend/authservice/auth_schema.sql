CREATE DATABASE authentication_db;
USE authentication_db;

--  Create users table  --
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,

    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NULL,
    google_id VARCHAR(255) UNIQUE NULL,

    auth_provider ENUM('email', 'google') NOT NULL DEFAULT 'email',

    -- OTP (hashed like password)
    otp VARCHAR(255) NULL,
    otp_created_at DATETIME NULL,
    otp_expires_at DATETIME NULL,

    -- OTP Resend Tracking
    otp_resend_count INT DEFAULT 0,
    last_otp_sent_at DATETIME NULL,

    -- OTP expiration status 
    otp_expired ENUM('true', 'false') NOT NULL DEFAULT 'false',

    -- User verification status 
    user_verified ENUM('true', 'false') NOT NULL DEFAULT 'false',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_google_id (google_id),
    INDEX idx_auth_provider (auth_provider),
    INDEX idx_user_verified (user_verified),
    INDEX idx_otp_expired (otp_expired),

    CONSTRAINT chk_auth_provider CHECK (
        (auth_provider = 'email' AND password IS NOT NULL)
        OR
        (auth_provider = 'google' AND google_id IS NOT NULL)
    )
);

-- Create refresh_tokens table --
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,

    token VARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
);

--  Create password_reset_tokens table --
CREATE TABLE password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,

    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,

    used ENUM('true', 'false') NOT NULL DEFAULT 'false',
    used_at DATETIME NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_reset_token (token),
    INDEX idx_reset_user (user_id)
);