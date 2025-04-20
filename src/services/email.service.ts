import nodemailer, { Transporter } from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { SendEmailError } from '../utils/SendEmailError';

// Define compile options interface
interface HandlebarsCompileOptions {
    allowProtoPropertiesByDefault?: boolean;
    allowProtoMethodsByDefault?: boolean;
    noEscape?: boolean;
    strict?: boolean;
    knownHelpers?: {
        [name: string]: boolean;
    };
    knownHelpersOnly?: boolean;
}

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
            const templatePath = path.join(process.cwd(), 'src/templates/email', `${template}.hbs`);
            const source = fs.readFileSync(templatePath, 'utf-8');
            
            // Configure Handlebars runtime and compile template
            const runtimeOpts = {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            } as HandlebarsCompileOptions;
            
            const compiledTemplate = Handlebars.compile(source, runtimeOpts);
            const html = compiledTemplate(context, { 
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            });

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
            throw new SendEmailError();
        }
    }
}

export const emailService = new EmailService();
