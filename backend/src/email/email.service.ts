// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class EmailService {
//   private transporter: nodemailer.Transporter;

//   constructor(private configService: ConfigService) {
//     this.transporter = nodemailer.createTransporter({
//       host: this.configService.get('SMTP_HOST'),
//       port: this.configService.get('SMTP_PORT'),
//       secure: false,
//       auth: {
//         user: this.configService.get('SMTP_USER'),
//         pass: this.configService.get('SMTP_PASS'),
//       },
//     });
//   }

// }
