const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const otpBox = (otp) => `
  <div style="background:#f0fdf4;border:2px dashed #006b2c;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
    <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your OTP Code</p>
    <p style="color:#006b2c;font-size:36px;font-weight:800;letter-spacing:10px;margin:0;">${otp}</p>
    <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Expires in <strong>10 minutes</strong></p>
  </div>
`

const wrapper = (content) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#006b2c;font-size:24px;margin:0;">PharmaX</h1>
      <p style="color:#6b7280;font-size:13px;margin-top:4px;">Healthcare Portal</p>
    </div>
    <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e5e7eb;">
      ${content}
    </div>
    <p style="text-align:center;color:#d1d5db;font-size:11px;margin-top:20px;">
      &copy; ${new Date().getFullYear()} PharmaX. All rights reserved.
    </p>
  </div>
`

const sendVerificationEmail = async (toEmail, fullName, otp) => {
  await transporter.sendMail({
    from: `"PharmaX" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your PharmaX account',
    html: wrapper(`
      <p style="color:#111827;font-size:15px;margin:0 0 8px;">Welcome, <strong>${fullName}</strong>!</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
        Thanks for signing up. Enter the OTP below to verify your email and activate your account.
      </p>
      ${otpBox(otp)}
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        If you didn't create a PharmaX account, you can safely ignore this email.
      </p>
    `),
  })
}

const sendOtpEmail = async (toEmail, fullName, otp) => {
  await transporter.sendMail({
    from: `"PharmaX" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your PharmaX Password Reset OTP',
    html: wrapper(`
      <p style="color:#111827;font-size:15px;margin:0 0 8px;">Hi <strong>${fullName}</strong>,</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
        We received a request to reset your PharmaX password. Use the OTP below to proceed.
      </p>
      ${otpBox(otp)}
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `),
  })
}

module.exports = { sendOtpEmail, sendVerificationEmail }
