const nodemailer = require('nodemailer');


function getTeamInvitationTemplate(userName, teamName, inviteLink) {
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
                    background-color: #007bff;
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
                    <p>Hi, <strong>${userName}</strong></p>
                    <p>You have been invited to join the team <strong>${teamName}</strong> on our project management platform.</p>
                    <p>Click the button below to accept the invitation and start collaborating:</p>
                    <p><a href="${inviteLink}" class="button">Accept Invitation</a></p>
                </div>
                <div class="footer">
                    <p>If you were not expecting this invitation, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

const sendInviteEmail = async (email, teamName, inviteLink) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Update this for your email service provider
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const emailPrefix = email.includes('@') ? email.split('@')[0] : ''

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Team Invitation',
        html: getTeamInvitationTemplate(emailPrefix, teamName, inviteLink),
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendInviteEmail };
