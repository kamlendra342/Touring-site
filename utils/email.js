/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
//nodemailer
const nodemailer = require('nodemailer');
const HtmltoText = require('html-to-text');
const pug = require('pug');

// creating object from emailclass;
// new Email(user,url).sendwelcome();


module.exports = class Email{
    constructor(user, url) {
        this.to = user.email;
        this.firstname = user.name.split(' ')[0];
        this.url = url;
        this.from = `kamlendra <${process.env.EMAIL_FROM}>`;
    }
    createNewTransport() {
        if (process.env.NODE_ENV === "production") {
            return nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port:465,
                auth: {
                    user: 'kamlendratriapthi@gmail.com',
                    pass: 'ymynjsimiatzauqt'
                }
            })

        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            //Activate in gmail "less secure app" aption
        });

    }
    async send (template, subject) {
        // reder html based on pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstname: this.firstname,
            url: this.url,
            subject
        });

        // define the email option
        const mailoptions = {
            from: this.from,
            to: this.to,
            subject,
            text: HtmltoText.fromString(html),
            html    // this is important to show the html verion of your page
        };
        // create a transport and send email
        await this.createNewTransport().sendMail(mailoptions);
    
    }
    async sendwelcome() {
        await this.send('welcome','welcome to our family');
    }
    async Sendpasswordreset() {
        await this.send('passwordRest', 'Your password reset link is valid for 10 min');
    }
}
