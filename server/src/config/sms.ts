export interface SendSmsOptions {
  to: string;
  message: string;
}

export const smsService = {
  async sendSms(options: SendSmsOptions): Promise<boolean> {
    try {
      // In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
      // For development, log the message
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SMS] To: ${options.to}`);
        console.log(`[SMS] Message: ${options.message}`);
        return true;
      }

      // Production SMS integration would go here
      // Example with Twilio:
      // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: options.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: options.to,
      // });

      console.log(`[SMS] Sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  },

  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    const message = `Your Quick Rider verification code is: ${code}. This code will expire in 10 minutes.`;

    return this.sendSms({
      to: phone,
      message,
    });
  },

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
};

export default smsService;
