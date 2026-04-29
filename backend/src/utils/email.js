import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const emailTemplates = {
  'contact-confirmation': (data) => ({
    subject: 'We received your message',
    html: `
      <h2>Hello ${data.name},</h2>
      <p>Thank you for contacting us. We have received your message and will get back to you soon.</p>
      <p>Our team typically responds within 24 hours.</p>
      <p>Best regards,<br>Freelancer Team</p>
    `
  }),
  'admin-contact-notification': (data) => ({
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phoneNumber || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `
  }),
  'payment-confirmation': (data) => ({
    subject: 'Payment Confirmation',
    html: `
      <h2>Payment Received</h2>
      <p>Thank you for your payment!</p>
      <p><strong>Amount:</strong> ₹${data.amount}</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Payment ID:</strong> ${data.paymentId}</p>
      <p>Our team will contact you shortly to proceed with your project.</p>
      <p>Best regards,<br>Freelancer Team</p>
    `
  }),
  'admin-payment-notification': (data) => ({
    subject: 'New Payment Received',
    html: `
      <h2>New Payment Received</h2>
      <p><strong>Amount:</strong> ₹${data.amount}</p>
      <p><strong>Client Email:</strong> ${data.email}</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p>Please contact the client and proceed with the project.</p>
    `
  })
};

export const sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    let emailHtml = html;

    if (template && emailTemplates[template]) {
      const templateContent = emailTemplates[template](data);
      emailHtml = templateContent.html;
      subject = templateContent.subject;
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: emailHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email transporter is ready');
    return true;
  } catch (error) {
    console.error('Email transporter error:', error);
    return false;
  }
};
