const chromium = require('@sparticuz/chromium');
const awsSDK = require('aws-sdk');
const { S3, DynamoDB } = awsSDK;
const fs = require('fs');
const path = require('path');
let puppeteer;

// Check if we're running in a Lambda environment or locally
const isLocal = process.env.IS_OFFLINE;

if (isLocal) {
  puppeteer = require('puppeteer'); // Use full Puppeteer for local testing
} else {
  puppeteer = require('puppeteer-core'); // Use puppeteer-core for Lambda
}

const s3 = new S3();
const S3Bucket = process.env.S3_BUCKET || 'cogdrisk-reports';

const dynamoDb = new DynamoDB.DocumentClient();
const DynamoDBTable = process.env.DYNAMODB_TABLE || 'Reports';

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const data = body.data;
    const personal = body.personal;
    // console.log(data);
    const chPath = await chromium.executablePath();

    // Configure Puppeteer based on environment
    const browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args, // Use appropriate arguments
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal ? undefined : chPath, // Local does not need `executablePath`
      headless: isLocal ? true : chromium.headless,
    });

    const page = await browser.newPage();

    // Load local HTML file (make sure this file is included in your Lambda deployment package)
    const filePath = path.resolve(__dirname, './templates/index.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');

    // Load CSS and SVG files
    const cssPath = path.resolve(__dirname, './templates/styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const MAX_SCORE = 48.25;
    const finalCSS = cssContent.replace("--gauge-dementia-percent: 0;", `--gauge-dementia-percent: ${data.scores.dementia_score / MAX_SCORE};`)
      .replace("--gauge-stroke-percent: 0;", `--gauge-stroke-percent: ${data.scores.stroke_score / MAX_SCORE};`)
      .replace("--gauge-mi-percent: 0;", `--gauge-mi-percent: ${data.scores.mi_score / MAX_SCORE};`)
      .replace("--gauge-diabetes-percent: 0;", `--gauge-diabetes-percent: ${data.scores.diabetes_score / MAX_SCORE};`);

    const svgPath = path.resolve(__dirname, './templates/gauge.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    const svg2Path = path.resolve(__dirname, './templates/gauge-needle.svg');
    const svg2Content = fs.readFileSync(svg2Path, 'utf8');

    // Inject CSS and SVG content into the HTML
    const htmlWithCSS = htmlContent.replaceAll('<link rel="stylesheet" href="styles.css">', `<style>${finalCSS}</style>`);
    const htmlWithSVG = htmlWithCSS.replaceAll('<img src="gauge.svg" alt="gauge" />', svgContent);
    const htmlWithSVG2 = htmlWithSVG.replaceAll('<img src="gauge-needle.svg" alt="gauge-needle" class="svg-gauge-needle" />', svg2Content);
    const finalHTML = htmlWithSVG2;

    await page.setContent(finalHTML, { waitUntil: 'networkidle0' });

    await page.evaluate((data) => {
      document.querySelector('#dementia-gauge .risk-score').innerHTML = data.scores.dementia_score;
      document.querySelector('#stroke-gauge .risk-score').innerHTML = data.scores.stroke_score;
      document.querySelector('#mi-gauge .risk-score').innerHTML = data.scores.mi_score;
      document.querySelector('#diabetes-gauge .risk-score').innerHTML = data.scores.diabetes_score;
    }, data);


    // Generate PDF from the HTML content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '32px',
        right: '32px',
        bottom: '32px',
        left: '32px',
      },
    });

    await browser.close();
    const dt = Date.now();
    // Upload the PDF to S3
    const fileName = `report-${dt}-${"0"}.pdf`;
    await s3
      .putObject({
        Bucket: S3Bucket,
        Key: fileName,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      })
      .promise();

    const region = process.env.AWS_REGION || "ap-southeast-2";
    const URL = `https://${S3Bucket}.s3.${region}.amazonaws.com/${fileName}`

    const dynamoParams = {
      TableName: DynamoDBTable,
      Item: {
        id: dt.toString(),
        personal,
        fileName,
        url: URL,
        data: data, // Storing data object if needed
        createdAt: new Date().toISOString(),
      },
    };

    await dynamoDb.put(dynamoParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'PDF generated successfully', fileName, URL }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
    };
  } catch (error) {
    console.log('An error occurred:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred',
        error: error.message,
        isLocal
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
    };
  }
};
