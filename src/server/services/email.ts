import nodemailer from 'nodemailer';

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // 你的Gmail邮箱
    pass: process.env.GMAIL_APP_PASSWORD // 应用专用密码
  },
});

// 发送验证码邮件
export async function sendVerificationEmail(to: string, code: string) {
  try {
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: 'SeeBigBigWorld - Your Verification Code',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">SeeBigBigWorld</h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 32px 24px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1F2937; margin: 0 0 12px 0; font-size: 20px;">Verification Code</h2>
              <p style="color: #6B7280; font-size: 16px; margin: 0;">
                Please use the code below to complete your verification
              </p>
            </div>

            <!-- Verification Code -->
            <div style="text-align: center; margin: 32px 0;">
              <span style="
                font-size: 32px;
                font-weight: bold;
                color: #4F46E5;
                letter-spacing: 8px;
                font-family: monospace;
                padding: 16px 24px;
                border: 2px solid #E5E7EB;
                border-radius: 8px;
              ">${code}</span>
            </div>

            <!-- Expiration Notice -->
            <p style="
              text-align: center;
              color: #6B7280;
              font-size: 14px;
              margin: 24px 0;
            ">
              This code will expire in 5 minutes for security purposes.
            </p>

            <!-- Security Notice -->
            <div style="
              background-color: #F3F4F6;
              border-radius: 8px;
              padding: 16px;
              margin-top: 24px;
              text-align: center;
            ">
              <p style="color: #6B7280; font-size: 14px; margin: 0;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="
            background-color: #F9FAFB;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          ">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} SeeBigBigWorld. All rights reserved.
            </p>
          </div>
        </div>
      `
    });
    console.log('邮件发送结果:', result);
    return true;
  } catch (error) {
    console.error('发送邮件错误:', error);
    return false;
  }
}

// 生成验证码
export function generateVerificationCode(length = 6) {
  return Math.random().toString().slice(2, 2 + length);
}