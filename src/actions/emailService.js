// emailService.js
const AWS = require('aws-sdk');
const s3   = new AWS.S3();
const ses  = new AWS.SES({
  region: process.env.AWS_REGION || 'ap-southeast-2'
});

/**
 * Send an email with a single S3‐hosted attachment via raw MIME.
 *
 * @param {Object} options
 * @param {string} options.from       - mailbox to send from
 * @param {string} options.to         - recipient address
 * @param {string} options.subject    - email subject line
 * @param {string} options.bodyText   - plain‐text body
 * @param {string} options.bucket     - S3 bucket name
 * @param {string} options.key        - S3 object key of the attachment
 * @param {string} options.replyTo       - mailbox to send from
 */
async function sendEmailWithAttachment({
  from, 
  to, 
  subject,
  bodyText, 
  bucket, 
  key,
  replyTo
}) {
  // 1) pull the object down from S3
  const { Body } = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  const pdfBase64 = Body.toString('base64');

  // 2) build a raw MIME multipart message
  const boundary = `NextPart_${Date.now()}`;
  const filename = key.split('/').pop();
  const rawLines = [
    `From: ${from}`,
    `Reply-To: ${replyTo}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    bodyText,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    pdfBase64,
    ``,
    `--${boundary}--`,
    ``
  ];
  const rawEmail = rawLines.join('\r\n');

  // 3) hand it off to SES
  await ses.sendRawEmail({
    RawMessage: { Data: rawEmail }
  }).promise();
}

module.exports = { sendEmailWithAttachment };
