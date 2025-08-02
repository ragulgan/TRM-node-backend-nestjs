import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class EmailService {
    constructor(private readonly mailService: MailerService) { }

    private emailTemplates = {
        miller: (name: string, message: string, companyName: string, email: string, mobileNumber: string, district: string, city: string, productOwnername: string, productName: string) => `
      <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dddddd;  overflow: hidden;">
            <div style="display: flex; align-items: center; background: rgba(32, 158, 46, 1); padding: 10px 20px; color: white; font-family: Arial, sans-serif;">
                <div style=" padding: 10px; ">
                    <a href="https://tnrmoa.com/" target="_blank">
                        <img src="https://trmdemo.shenll.com/fileUpload/read/b0edc2bd-95d1-4587-9cdd-2074cc45fdac.png"  style="width: 280px; height: auto; display: block;" alt="TRM Logo" onerror="this.onerror=null; this.src='https://via.placeholder.com/80';">
                    </a>
                </div>
            </div>
            <!-- Content Section -->
            <div style="padding: 36px;">
                <p style="margin: 0 0 26px;">Dear <strong>${productOwnername}</strong>,</p>
                <p style="margin: 0 0 26px;">Tamil Nadu Rice Mill Owners Association</p>
                <p style="margin: 0 0 24px; line-height: 26px;">
                    One of our esteemed members, <strong>${name}</strong> of <strong>${companyName}</strong>, has submitted a query regarding your <strong>${productName}</strong>.
                </p>
                <!-- Details Box -->
                <div style="background-color: rgba(241, 245, 249, 1); border: 1px solid #dddddd; border-radius: 8px; padding: 26px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 10px; font-size: 16px; color: rgba(56, 72, 96, 1);">Details:</h2>
                    <p style="margin: 0; font-size: 14px; line-height: 26px;">
                       <strong>${message}</strong></p>
                </div>
                <!-- Sender Details -->
                <div style="background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; padding: 26px;">
                    <h3 style="margin: 0 0 20px; font-size: 16px; color: rgba(56, 72, 96, 1);">From:</h3>
                    <p style="margin: 0 0 15px; font-size: 14px;">Name:<strong>${name} </strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mill Name:<strong> ${companyName}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Email:<strong>${email}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mobile:<strong>${mobileNumber}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">District:<strong>${district}</strong></p>
                    <p style="margin: 0; font-size: 14px;">City:<strong>${city}</strong></p>
                </div>
                <!-- Closing Note -->
                <p style="margin: 20px 0 10px; font-weight: 400;  line-height: 26px;">
                    Please respond at your earliest convenience to ensure the miller has the information needed to proceed. If you'd like further clarification or to establish direct communication, we're happy to assist.
                </p>
                <p style="margin: 0 0 20px; font-weight: 400;  line-height: 26px;">
                    Thank you for your continued support in empowering the rice milling industry with your innovative solutions!
                </p>
            </div>
            <!-- Footer Section -->
            <table role="presentation" width="100%" style="border-top: 3px solid rgba(32, 158, 46, 1); padding: 30px 36px; font-family: Arial, sans-serif; background-color: white;">
                <tr>
                    <td style="font-size: 14px; color: #333; padding: 0;">
                        <p style="margin: 0 0 8px;">Best Regards,</p>
                        <p style="margin: 0; font-weight: bold;">TamilNadu Rice Mill Owner Association</p>
                    </td>
                </tr>
            </table>
            </div>
        </body>
        </html>
    `,
        supplier: (name: string, message: string, companyName: string, email: string, mobileNumber: string, district: string, city: string, productOwnername: string, productName: string) => `
      <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dddddd;  overflow: hidden;">
            <div style="display: flex; align-items: center; background: rgba(32, 158, 46, 1); padding: 10px 20px; color: white; font-family: Arial, sans-serif;">
                <div style=" padding: 10px; ">
                    <a href="https://tnrmoa.com/" target="_blank">
                        <img src="https://trmdemo.shenll.com/fileUpload/read/b0edc2bd-95d1-4587-9cdd-2074cc45fdac.png"  style="width: 280px; height: auto; display: block;" alt="TRM Logo" onerror="this.onerror=null; this.src='https://via.placeholder.com/80';">
                    </a>
                </div>
            </div>
            <!-- Content Section -->
            <div style="padding: 36px;">
                <p style="margin: 0 0 26px;">Dear <strong>${productOwnername}</strong>,</p>
                <p style="margin: 0 0 26px;">Tamil Nadu Rice Mill Owners Association</p>
                <p style="margin: 0 0 24px; line-height: 26px;">
                    One of our esteemed members, <strong>${name}</strong> of <strong>${companyName}</strong>, has submitted a query regarding your <strong>${productName}</strong>.
                </p>
                <!-- Details Box -->
                <div style="background-color: rgba(241, 245, 249, 1); border: 1px solid #dddddd; border-radius: 8px; padding: 26px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 10px; font-size: 16px; color: rgba(56, 72, 96, 1);">Details:</h2>
                    <p style="margin: 0; font-size: 14px; line-height: 26px;">
                       <strong>${message}</strong></p>
                </div>
                <!-- Sender Details -->
                <div style="background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; padding: 26px;">
                    <h3 style="margin: 0 0 20px; font-size: 16px; color: rgba(56, 72, 96, 1);">From:</h3>
                    <p style="margin: 0 0 15px; font-size: 14px;">Name:<strong>${name} </strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mill Name:<strong> ${companyName}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Email:<strong>${email}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mobile:<strong>${mobileNumber}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">District:<strong>${district}</strong></p>
                    <p style="margin: 0; font-size: 14px;">City:<strong>${city}</strong></p>
                </div>
                <!-- Closing Note -->
                <p style="margin: 20px 0 10px; font-weight: 400;  line-height: 26px;">
                    Please respond at your earliest convenience to ensure the miller has the information needed to proceed. If you'd like further clarification or to establish direct communication, we're happy to assist.
                </p>
                <p style="margin: 0 0 20px; font-weight: 400;  line-height: 26px;">
                    Thank you for your continued support in empowering the rice milling industry with your innovative solutions!
                </p>
            </div>
            <!-- Footer Section -->
            <div style="border-top: 3px solid rgba(32, 158, 46, 1); padding: 30px 36px; font-family: Arial, sans-serif; display: flex; justify-content: space-between; align-items: center; background-color: white;">
                <div style="font-size: 14px; color: #333;">
                    <p style="margin:0 0 8px;">Best Regards,</p>
                    <p style="margin: 0; font-weight: bold;">TamilNadu Rice Mill Owner Association</p>
                </div>
            </div>
            </div>
        </body>
        </html>
    `,
        service_provider: (name: string, message: string, companyName: string, email: string, mobileNumber: string, district: string, city: string, productOwnername: string, productName: string) => `
      <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dddddd;  overflow: hidden;">
            <div style="display: flex; align-items: center; background: rgba(32, 158, 46, 1); padding: 10px 20px; color: white; font-family: Arial, sans-serif;">
                <div style=" padding: 10px; ">
                    <a href="https://tnrmoa.com/" target="_blank">
                        <img src="https://trmdemo.shenll.com/fileUpload/read/b0edc2bd-95d1-4587-9cdd-2074cc45fdac.png"  style="width: 280px; height: auto; display: block;" alt="TRM Logo" onerror="this.onerror=null; this.src='https://via.placeholder.com/80';">
                    </a>
                </div>
            </div>
            <!-- Content Section -->
            <div style="padding: 36px;">
                <p style="margin: 0 0 26px;">Dear <strong>${productOwnername}</strong>,</p>
                <p style="margin: 0 0 26px;">Tamil Nadu Rice Mill Owners Association</p>
                <p style="margin: 0 0 24px; line-height: 26px;">
                    One of our esteemed members, <strong>${name}</strong> of <strong>${companyName}</strong>, has submitted a query regarding your <strong>${productName}</strong>.
                </p>
                <!-- Details Box -->
                <div style="background-color: rgba(241, 245, 249, 1); border: 1px solid #dddddd; border-radius: 8px; padding: 26px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 10px; font-size: 16px; color: rgba(56, 72, 96, 1);">Details:</h2>
                    <p style="margin: 0; font-size: 14px; line-height: 26px;">
                       <strong>${message}</strong></p>
                </div>
                <!-- Sender Details -->
                <div style="background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; padding: 26px;">
                    <h3 style="margin: 0 0 20px; font-size: 16px; color: rgba(56, 72, 96, 1);">From:</h3>
                    <p style="margin: 0 0 15px; font-size: 14px;">Name:<strong>${name} </strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mill Name:<strong> ${companyName}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Email:<strong>${email}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mobile:<strong>${mobileNumber}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">District:<strong>${district}</strong></p>
                    <p style="margin: 0; font-size: 14px;">City:<strong>${city}</strong></p>
                </div>
                <!-- Closing Note -->
                <p style="margin: 20px 0 10px; font-weight: 400;  line-height: 26px;">
                    Please respond at your earliest convenience to ensure the miller has the information needed to proceed. If you'd like further clarification or to establish direct communication, we're happy to assist.
                </p>
                <p style="margin: 0 0 20px; font-weight: 400;  line-height: 26px;">
                    Thank you for your continued support in empowering the rice milling industry with your innovative solutions!
                </p>
            </div>
            <!-- Footer Section -->
            <div style="border-top: 3px solid rgba(32, 158, 46, 1); padding: 30px 36px; font-family: Arial, sans-serif; display: flex; justify-content: space-between; align-items: center; background-color: white;">
                <div style="font-size: 14px; color: #333;">
                    <p style="margin:0 0 8px;">Best Regards,</p>
                    <p style="margin: 0; font-weight: bold;">TamilNadu Rice Mill Owner Association</p>
                </div>
            </div>
            </div>
        </body>
        </html>
    `,
        guest_user: (name: string, message: string, companyName: string, email: string, mobileNumber: string, district: string, city: string, productOwnername: string, productName: string) => `
      <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dddddd;  overflow: hidden;">
            <div style="display: flex; align-items: center; background: rgba(32, 158, 46, 1); padding: 10px 20px; color: white; font-family: Arial, sans-serif;">
                <div style=" padding: 10px; ">
                    <a href="https://tnrmoa.com/" target="_blank">
                        <img src="https://trmdemo.shenll.com/fileUpload/read/b0edc2bd-95d1-4587-9cdd-2074cc45fdac.png"  style="width: 280px; height: auto; display: block;" alt="TRM Logo" onerror="this.onerror=null; this.src='https://via.placeholder.com/80';">
                    </a>
                </div>
            </div>
            <!-- Content Section -->
            <div style="padding: 36px;">
                <p style="margin: 0 0 26px;">Dear <strong>${productOwnername}</strong>,</p>
                <p style="margin: 0 0 26px;">Tamil Nadu Rice Mill Owners Association</p>
                <p style="margin: 0 0 24px; line-height: 26px;">
                    One of our esteemed members, <strong>${name}</strong> of <strong>${companyName}</strong>, has submitted a query regarding your <strong>${productName}</strong>.
                </p>
                <!-- Details Box -->
                <div style="background-color: rgba(241, 245, 249, 1); border: 1px solid #dddddd; border-radius: 8px; padding: 26px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 10px; font-size: 16px; color: rgba(56, 72, 96, 1);">Details:</h2>
                    <p style="margin: 0; font-size: 14px; line-height: 26px;">
                       <strong>${message}</strong></p>
                </div>
                <!-- Sender Details -->
                <div style="background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; padding: 26px;">
                    <h3 style="margin: 0 0 20px; font-size: 16px; color: rgba(56, 72, 96, 1);">From:</h3>
                    <p style="margin: 0 0 15px; font-size: 14px;">Name:<strong>${name} </strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mill Name:<strong> ${companyName}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Email:<strong>${email}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">Mobile:<strong>${mobileNumber}</strong></p>
                    <p style="margin: 0 0 15px; font-size: 14px;">District:<strong>${district}</strong></p>
                    <p style="margin: 0; font-size: 14px;">City:<strong>${city}</strong></p>
                </div>
                <!-- Closing Note -->
                <p style="margin: 20px 0 10px; font-weight: 400;  line-height: 26px;">
                    Please respond at your earliest convenience to ensure the miller has the information needed to proceed. If you'd like further clarification or to establish direct communication, we're happy to assist.
                </p>
                <p style="margin: 0 0 20px; font-weight: 400;  line-height: 26px;">
                    Thank you for your continued support in empowering the rice milling industry with your innovative solutions!
                </p>
            </div>
            <!-- Footer Section -->
            <table role="presentation" width="100%" style="border-top: 3px solid rgba(32, 158, 46, 1); padding: 30px 36px; font-family: Arial, sans-serif; background-color: white;">
                <tr>
                    <td style="font-size: 14px; color: #333; padding: 0;">
                        <p style="margin: 0 0 8px;">Best Regards,</p>
                        <p style="margin: 0; font-weight: bold;">TamilNadu Rice Mill Owner Association</p>
                    </td>
                </tr>
            </table>
            </div>
        </body>
        </html>
    `
    };

    async sendMail(
        to: string,
        subject: string,
        userType: string,
        templateData: any
    ): Promise<string> {
        let htmlTemplate: string;

        switch (userType) {
            case 'MILLER':
                htmlTemplate = this.emailTemplates.miller(templateData.name, templateData.message, templateData.companyName, templateData.email, templateData.mobileNumber, templateData.district, templateData.city, templateData.productOwnername, templateData.productName);
                break;
            case 'SUPPLIER':
                htmlTemplate = this.emailTemplates.supplier(templateData.name, templateData.message, templateData.companyName, templateData.email, templateData.mobileNumber, templateData.district, templateData.city, templateData.productOwnername, templateData.productName);
                break;
            case 'SERVICE_PROVIDER':
                htmlTemplate = this.emailTemplates.service_provider(templateData.name, templateData.message, templateData.companyName, templateData.email, templateData.mobileNumber, templateData.district, templateData.city, templateData.productOwnername, templateData.productName);
                break;
            case 'GUEST_USER':
                htmlTemplate = this.emailTemplates.guest_user(templateData.name, templateData.message, templateData.companyName, templateData.email, templateData.mobileNumber, templateData.district, templateData.city, templateData.productOwnername, templateData.productName);
                break;
            default:
                throw new Error('Invalid user type');
        }

        try {
            this.mailService.sendMail({
                to,
                subject,
                html: htmlTemplate
            }).then((res) => {
                console.log("Contact received mail sent:", res?.messageId);
            }).catch((e) => {
                console.log("Contact not received mail:", e);
            })
            return htmlTemplate;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}