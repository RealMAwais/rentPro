/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


const app = express();

const allowedOrigins = ['http://localhost:4200', 'https://webapp-rentpro.web.app'];
app.use(cors({ origin: allowedOrigins }));
app.options('/send-email', cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({ origin: '*' }));
app.get('/', (req, res) => {
  res.send(`NodeJS Server is running.`);
});
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, body, attachment, filename } = req.body;
    const toEmail = decodeURIComponent(to);
    const decodedSubject = decodeURIComponent(subject);
    const decodedBody = decodeURIComponent(body);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'realmawais@gmail.com',
        pass: 'testing'
      }
    });
    // Convert the base64-encoded attachment to a buffer
    const pdfBuffer = Buffer.from(attachment, 'base64');
    // Create an email message
    const mailOptions = {
      from: 'realmawais@gmail.com',
      to: toEmail,
      subject: decodedSubject,
      text: decodedBody,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          encoding: 'base64',
          contentType: 'application/pdf'
        }
      ]
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ', info.response);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email: ', error.message || error);
    res.status(500).send(`Error sending email: ${error.message}`);
  }
});
exports.app = functions.https.onRequest(app);
