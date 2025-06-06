// backend/utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // ex: orbegaragem@gmail.com
    pass: process.env.EMAIL_PASS  // app password do Gmail
  }
});

const enviarEmail = async (destinatario, assunto, mensagemHtml) => {
  try {
    const info = await transporter.sendMail({
      from: `Orbe Garage <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: mensagemHtml
    });
    console.log('E-mail enviado:', info.response);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
};

module.exports = enviarEmail;
