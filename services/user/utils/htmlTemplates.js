function signUpTemplate(verifyLink) {
    return `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    width: 80px;
                    height: 80px;
                    margin-bottom: 10px;
                }
                .content {
                    font-size: 16px;
                    color: #333333;
                    margin-bottom: 20px;
                }
                .button {
                    display: inline-block;
                    background-color: #276be8;
                    color: #ffffff !important;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 16px;
                }
                    a{
                    color: #ffffff !important;
                    }
                .footer {
                    text-align: center;
                    font-size: 14px;
                    color: #777777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="logo">
                        <circle cx="100" cy="100" r="100" fill="#1A1A1A" />
                        <path
                            d="M 70 50 L 130 50 A 40 40 0 1 1 130 150 L 70 150 A 40 40 0 1 1 70 50"
                            fill="none"
                            stroke="white"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                        <line
                            x1="60"
                            y1="100"
                            x2="140"
                            y2="100"
                            stroke="white"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <div class="content">
                    <p>Thanks for signing up for cos-theta! We make your project tracking simple and effective by providing features that would blow your mind. We're excited to have you on board.</p>
                    <p>To complete your registration, please click the link below to verify your email:</p>
                    <p><a href="${verifyLink}" class="button">Verify Your Email</a></p>
                </div>
                <div class="footer">
                    <p>If you did not sign up for this service, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = { signUpTemplate }