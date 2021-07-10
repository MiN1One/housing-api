const nodemailer = require('nodemailer');
const pug = require('pug');

class Email {
  constructor(user, url) {
    this.url = url;
    this.firstName = this.user.name.split(' ')[0];
    this.lastName = this.user.name.split(' ')[1];
    this.to = this.user.email;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {

      return;
    }

    return nodemailer.createTransport({
      host: process.env.DEV_EMAIL_HOST,
      port: process.env.DEV_EMAIL_PORT,
      auth: {
        user: process.env.DEV_EMAIL_USER,
        pass: process.env.DEV_EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    
    this.createTransport().sendMail({
      from: `Housingcom <${process.env.VENDOR_EMAIL}>`,
      to: this.to,
      subject
    });
  }

  async resetPassword() {

  }

  async signupVerification() {

  }
}

module.exports = Email;