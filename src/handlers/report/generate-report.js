const chromium = require('@sparticuz/chromium');
const awsSDK = require('aws-sdk');
const { S3, DynamoDB } = awsSDK;
const fs = require('fs');
const path = require('path');
const { evaluateRecommendationTable } = require('./recommendation-table');
const { evaluateSummaryTable } = require('./summary-table');
let puppeteer;

const isLocal = process.env.IS_OFFLINE;
if (isLocal) {
  puppeteer = require('puppeteer');
} else {
  puppeteer = require('puppeteer-core');
}

const s3 = new S3();
const dynamoDb = new DynamoDB.DocumentClient();
const S3Bucket = process.env.S3_BUCKET || 'cogdrisk-reports';
const DynamoDBTable = process.env.DYNAMODB_TABLE || 'Reports';

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const data = body.data;      // contains .scores and .inputs
    const personal = body.personal;
    // console.log(data);

    const chPath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal ? undefined : chPath,
      headless: isLocal ? true : chromium.headless,
    });
    const page = await browser.newPage();

    // Load and inject HTML/CSS/SVG as before...
    const filePath = path.resolve(__dirname, './templates/index.html');
    let html = fs.readFileSync(filePath, 'utf8');
    const cssPath = path.resolve(__dirname, './templates/styles.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    // update your gauge CSS vars...
    const MAX_SCORE = 48.25;
    const finalCSS = css
      .replace("--gauge-dementia-percent: 0;", `--gauge-dementia-percent: ${data.scores.dementia_score / MAX_SCORE};`)
      .replace("--gauge-stroke-percent: 0;", `--gauge-stroke-percent: ${data.scores.stroke_score / MAX_SCORE};`)
      .replace("--gauge-mi-percent: 0;", `--gauge-mi-percent:       ${data.scores.mi_score / MAX_SCORE};`)
      .replace("--gauge-diabetes-percent: 0;", `--gauge-diabetes-percent: ${data.scores.diabetes_score / MAX_SCORE};`);
    html = html
      .replaceAll('<link rel="stylesheet" href="styles.css">', `<style>${finalCSS}</style>`)
      .replaceAll('<img src="gauge.svg" alt="gauge" />', `${fs.readFileSync(path.resolve(__dirname, './templates/gauge.svg'), 'utf8')}`)
      .replaceAll('<img src="gauge-needle.svg" alt="gauge-needle" class="svg-gauge-needle" />', `${fs.readFileSync(path.resolve(__dirname, './templates/gauge-needle.svg'), 'utf8')}`);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // inject the raw scores into the gauge overlays
    await page.evaluate((scores) => {
      document.querySelector('#dementia-gauge .risk-score').innerHTML = scores.dementia_score;
      document.querySelector('#stroke-gauge .risk-score').innerHTML = scores.stroke_score;
      document.querySelector('#mi-gauge .risk-score').innerHTML = scores.mi_score;
      document.querySelector('#diabetes-gauge .risk-score').innerHTML = scores.diabetes_score;
    }, data.scores);

    const SURVEY_TYPE = process.env.SURVEY_TYPE
    await page.evaluate((SURVEY_TYPE) => {
      function getFormattedDate() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const yyyy = today.getFullYear();

        return `${dd}/${mm}/${yyyy}`;
      }

      const capitalizedSurveyType = SURVEY_TYPE.charAt(0).toUpperCase() + SURVEY_TYPE.slice(1);
      const date = getFormattedDate();
      document.querySelector('#date-label').innerHTML = date;
      document.querySelector('#survey-type-label').innerHTML = capitalizedSurveyType;
      
    }, SURVEY_TYPE);

    await evaluateSummaryTable(page, data);
    await evaluateRecommendationTable(page, data);

    const renderedHtml = await page.content();

    const minifiedHtml = renderedHtml
      .replace(/\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // now export PDF, upload, etc.
    const pdfBuffer = await page.pdf({
      format: 'A4', printBackground: true, margin: { top: '32px', right: '32px', bottom: '32px', left: '32px' }
    });
    await browser.close();



    // S3 upload + DynamoDB save + return URL...
    const dt = Date.now().toString();
    const fileName = `report-${dt}-0.pdf`;
    await s3.putObject({ Bucket: S3Bucket, Key: fileName, Body: pdfBuffer, ContentType: 'application/pdf' }).promise();
    const region = process.env.AWS_REGION || 'ap-southeast-2';
    const URL = `https://${S3Bucket}.s3.${region}.amazonaws.com/${fileName}`;

    await dynamoDb.put({
      TableName: DynamoDBTable,
      Item: { id: dt, personal, fileName, url: URL, data, createdAt: new Date().toISOString() }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({
        message: 'PDF generated successfully',
        fileName,
        URL,
        html: minifiedHtml
      })
    };
  }
  catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Error generating PDF', error: err.message })
    };
  }
};
