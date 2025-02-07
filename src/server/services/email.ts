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


// 发送加速服务到期提醒邮件
export async function sendExpirationNoticeEmail(to: string, params: {
  username: string;
  expirationDate: Date;
  daysRemaining: number;
  serviceType: string;
  renewalLink: string;
}) {
  try {
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: 'SeeBigBigWorld - 您的加速服务即将到期',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">SeeBigBigWorld</h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 32px 24px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1F2937; margin: 0 0 12px 0; font-size: 20px;">服务到期提醒</h2>
              <p style="color: #6B7280; font-size: 16px; margin: 0;">
                您好 ${params.username}，您的加速服务即将到期
              </p>
            </div>

            <!-- Expiration Notice -->
            <div style="
              background-color: #FEF2F2;
              border: 1px solid #FEE2E2;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              text-align: center;
            ">
              <p style="color: #991B1B; font-size: 16px; margin: 0;">
                您的${params.serviceType}将在 <strong>${params.daysRemaining}</strong> 天后到期
              </p>
              <p style="color: #991B1B; font-size: 14px; margin: 8px 0 0 0;">
                到期时间：${params.expirationDate.toLocaleDateString()}
              </p>
            </div>

            <!-- Renewal Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${params.renewalLink}" style="
                background-color: #4F46E5;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                display: inline-block;
              ">
                立即续费
              </a>
            </div>

            <!-- Benefits -->
            <div style="margin: 32px 0;">
              <h3 style="color: #1F2937; font-size: 16px; margin: 0 0 16px 0;">续费优惠</h3>
              <ul style="
                color: #4B5563;
                font-size: 14px;
                margin: 0;
                padding: 0 0 0 20px;
              ">
                <li style="margin-bottom: 8px;">续费享受老用户专属优惠</li>
                <li style="margin-bottom: 8px;">支持按月/季/年续费，灵活选择</li>
                <li style="margin-bottom: 8px;">续费即可继续享受稳定服务</li>
              </ul>
            </div>

            <!-- Help Notice -->
            <div style="
              background-color: #F3F4F6;
              border-radius: 8px;
              padding: 16px;
              margin-top: 24px;
              text-align: center;
            ">
              <p style="color: #6B7280; font-size: 14px; margin: 0;">
                如需帮助，请联系客服支持
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
    console.log('到期提醒邮件发送结果:', result);
    return true;
  } catch (error) {
    console.error('发送到期提醒邮件错误:', error);
    return false;
  }
}

// 生成验证码
export function generateVerificationCode(length = 6) {
  return Math.random().toString().slice(2, 2 + length);
}