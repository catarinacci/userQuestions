import nodemailer, { Transporter } from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendEmail({ to, subject, template, context }: EmailOptions): Promise<void> {
        try {
            // Read template file
            const templatePath = path.join(__dirname, '../templates', `${template}.hbs`);
            const source = fs.readFileSync(templatePath, 'utf-8');
            
            // Compile template
            const compiledTemplate = Handlebars.compile(source);
            const html = compiledTemplate(context);

            // Send email
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                html,
            });

            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}

export const emailService = new EmailService();
