// sendConsent.js

const { sendEmailWithAttachment } = require("../../actions/emailService");

const STATIC_BUCKET = process.env.PDF_BUCKET || 'lead-survey-static-content';
const FILE_NAME = process.env.PDF_KEY || 'consent/DemNCDrisk_PISCF.docx';
const FROM_ADDRESS = '"CogDrisk" <no-reply@chronicdiseaserisk.com.au>';
const SUBJECT_LINE = 'Your Information & Consent Form';
const BODY_TEXT = 'This is your Information and Consent form included (attached) for consenting to have your data used in research';
const REPLY_TO = "DemNCDrisk@unsw.edu.au";

exports.handler = async (event) => {
  try {
    // parse & validate
    const { email } = JSON.parse(event.body || '{}');
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing email address' })
      };
    }

    // delegate to our reusable function
    await sendEmailWithAttachment({
      from: FROM_ADDRESS,
      to: email,
      subject: SUBJECT_LINE,
      bodyText: BODY_TEXT,
      bucket: STATIC_BUCKET,
      key: FILE_NAME,
      replyTo: REPLY_TO
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: `Email sent to ${email}` })
    };
  }
  catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Failed to send email', error: err.message })
    };
  }
};
