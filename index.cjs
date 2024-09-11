const puppeteer = require('puppeteer');
const fs = require('fs');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CogDrisk Dementia Risk Assessment</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #5c6bc0;
            color: white;
            padding: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 1.2em;
        }
        .risk-score {
            font-weight: bold;
            color: #5c6bc0;
        }
        .flex-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 20px 0;
        }
        .text-content {
            flex: 1;
            padding-right: 20px;
        }
        .gauge {
            width: 200px;
            height: 100px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .good {
            background-color: #4caf50;
            color: white;
        }
        .improve {
            background-color: #ff9800;
            color: white;
        }
        .checkmark::before {
            content: "✓";
            color: green;
            margin-right: 5px;
        }
        .cross::before {
            content: "✗";
            color: red;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CogDrisk</h1>
        <p>PERSONALISED DEMENTIA RISK ASSESSMENT</p>
    </div>
    
    <p>Date of Assessment: 5/14/2024</p>
    <p>Congratulations on completing the dementia risk assessment.</p>
    
    <div class="flex-container">
        <div class="text-content">
            <p>Your CogDrisk dementia score is <span class="risk-score">30.25</span></p>
            <p>The risk score has been developed using an evidence-based approach. The risk score ranges from 0 to 48.25, with a higher score indicating higher risk.</p>
        </div>
        <svg class="gauge" viewBox="0 0 100 50">
            <path d="M10 40 A 40 40 0 0 1 90 40" fill="none" stroke="#e0e0e0" stroke-width="10"/>
            <path d="M10 40 A 40 40 0 0 1 70 12" fill="none" stroke="#5c6bc0" stroke-width="10"/>
            <text x="5" y="45" font-size="10">0</text>
            <text x="95" y="45" font-size="10" text-anchor="end">48.25</text>
            <text x="50" y="30" text-anchor="middle" font-size="15">30.25</text>
        </svg>
    </div>
    
    <p>Below is your personalised report based on your current health and lifestyle factors.</p>
    
    <table>
        <tr>
            <th></th>
            <th class="good">Keep up the good work!</th>
            <th class="improve">Room for improvement</th>
        </tr>
        <tr>
            <td><strong>Demographic factor</strong></td>
            <td></td>
            <td class="cross">Your highest qualification was less than secondary education</td>
        </tr>
        <tr>
            <td><strong>Medical risk factors</strong></td>
            <td>
                <p class="checkmark">No prior stroke</p>
                <p class="checkmark">Good levels of sleep</p>
            </td>
            <td>
                <p class="cross">Your weight is in the obese range</p>
                <p class="cross">Having high cholesterol level</p>
                <p class="cross">Having diabetes</p>
                <p class="cross">Having prior brain injury</p>
                <p class="cross">Having hypertension</p>
                <p class="cross">Having atrial fibrillation</p>
                <p class="cross">Having depressive symptoms</p>
            </td>
        </tr>
        <tr>
            <td><strong>Lifestyle habits and diet</strong></td>
            <td>
                <p class="checkmark">High levels of social engagement</p>
                <p class="checkmark">You drink low to moderate levels of alcohol</p>
                <p class="checkmark">You do not smoke</p>
            </td>
            <td>
                <p class="cross">Low levels of physical activity</p>
                <p class="cross">Low levels of cognitive engagement</p>
                <p class="cross">Eating fish less than once a week</p>
            </td>
        </tr>
        <tr>
            <td><strong>Environmental exposure</strong></td>
            <td></td>
            <td class="cross">Being exposed to pesticides</td>
        </tr>
    </table>
</body>
</html>
`;

async function generatePDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: 'cogdrisk_report.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    });

    await browser.close();
    console.log('PDF generated successfully');
}

generatePDF().catch(console.error);