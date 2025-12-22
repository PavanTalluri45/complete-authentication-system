const templates = {
    // 1. OTP Verification Email
    otpEmail: ({ full_name, otp }) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            body { 
                font-family: 'Rubik', sans-serif; 
                background-color: #f3f4f6; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 500px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border-radius: 16px; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 700; 
            }
            .content { 
                padding: 40px 30px; 
                text-align: center; 
                color: #374151;
            }
            .greeting {
                font-size: 18px;
                color: #111827;
                margin-bottom: 16px;
                font-weight: 500;
            }
            .message {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 24px;
                color: #4B5563;
            }
            .otp-container {
                background-color: #F3F4F6;
                border-radius: 12px;
                padding: 24px;
                margin: 24px 0;
            }
            .otp-code { 
                font-size: 32px; 
                font-weight: 700; 
                color: #2563EB; 
                letter-spacing: 8px; 
                margin: 0; 
            }
            .expiry {
                font-size: 14px;
                color: #6B7280;
                margin-top: 24px;
            }
            /* Button-like visual for consistency, though OTP is text */
            .highlight-text {
                color: #2563EB;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verification Code</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${full_name || 'User'}!</p>
                <p class="message">
                    To complete your login or registration, please use the following verification code:
                </p>
                
                <div class="otp-container">
                    <p class="otp-code">${otp}</p>
                </div>
                
                <p class="expiry">
                    This code will expire in <span class="highlight-text">5 minutes</span>.
                </p>
            </div>
        </div>
    </body>
    </html>
    `,

    // 2. Reset Password Email
    resetPasswordEmail: ({ full_name, reset_url }) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            body { 
                font-family: 'Rubik', sans-serif; 
                background-color: #f3f4f6; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 500px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border-radius: 16px; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 700; 
            }
            .content { 
                padding: 40px 30px; 
                text-align: center; 
                color: #374151;
            }
            .greeting {
                font-size: 18px;
                color: #111827;
                margin-bottom: 16px;
                font-weight: 500;
            }
            .message {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 32px;
                color: #4B5563;
            }
            /* Exact requested button CSS converted to inline styles */
            .reset-btn {
                display: block;
                width: 100%;
                box-sizing: border-box;
                height: 48px;
                line-height: 48px;
                border-radius: 9999px;
                font-size: 16px;
                font-weight: 500;
                background-color: #2563EB;
                color: #ffffff;
                text-align: center;
                text-decoration: none;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                transition: all 0.2s ease;
                margin-bottom: 24px;
            }
            /* Hover emulation for supported clients */
            .reset-btn:hover {
                background-color: #1D4ED8;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                transform: scale(1.02);
            }
            .expiry {
                font-size: 14px;
                color: #6B7280;
                margin-top: 24px;
            }
            .highlight-text {
                color: #2563EB;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reset Password</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${full_name || 'User'}!</p>
                <p class="message">
                    We received a request to reset your password. Click the button below to proceed.
                </p>
                
                <a href="${reset_url}" class="reset-btn" style="color: #ffffff !important; text-decoration: none;">
                    <span style="color: #ffffff !important; text-decoration: none;">Reset Password</span>
                </a>
                
                <p class="expiry">
                    This link will expire in <span class="highlight-text">15 minutes</span>.
                </p>
            </div>
        </div>
    </body>
    </html>
    `
};

module.exports = templates;