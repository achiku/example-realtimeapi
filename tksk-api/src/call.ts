import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  PHONE_NUMBER_FROM,
  DOMAIN,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !PHONE_NUMBER_FROM) {
  throw new Error('Twilio credentials or phone number are not set in the environment variables.');
}

const outboundTwiML = `
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy">Thanks for trying our documentation. Enjoy!</Say>
</Response>
`;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function makeCall(to: string) {
  try {
    const call = await client.calls.create({
      from: PHONE_NUMBER_FROM as string,
      to,
      twiml: outboundTwiML,
    });
    console.log(`Call started with SID: ${call.sid}`);
  } catch (error) {
    console.error('Error making call:', error);
  }
}

makeCall('+819029240818');