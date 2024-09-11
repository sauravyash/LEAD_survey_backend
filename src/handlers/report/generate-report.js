import PDFDocument from 'pdfkit';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const S3Bucket = process.env.S3_BUCKET || 'cogdrisk-reports';

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const {
      cogDriskScore,
      dateOfAssessment,
      demographicFactors,
      medicalRiskFactors,
      lifestyleHabits,
      environmentalExposure,
      recommendations
    } = body;

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#4A5AC4');
    doc.fill('white').fontSize(32).text('CogDrisk', 50, 30);
    doc.fontSize(16).text('PERSONALISED DEMENTIA RISK ASSESSMENT', 50, 70);

    doc.fill('black').fontSize(12).text(`Date of Assessment: ${dateOfAssessment}`, 50, 120);
    doc.moveDown();
    doc.text('Congratulations on completing the dementia risk assessment.');
    doc.moveDown();
    doc.fontSize(14).text(`Your CogDrisk dementia score is ${cogDriskScore}`, { bold: true });
    doc.moveDown();
    doc.fontSize(12).text('The risk score has been developed using an evidence-based approach. The risk score ranges from 0 to 48.25, with a higher score indicating higher risk.');

    // Risk score gauge
    const gaugeY = doc.y + 20;
    doc.arc(doc.page.width / 2, gaugeY + 50, 50, 0, Math.PI).stroke();
    const angle = (cogDriskScore / 48.25) * Math.PI;
    const needleEndX = doc.page.width / 2 + 45 * Math.cos(angle - Math.PI / 2);
    const needleEndY = gaugeY + 50 + 45 * Math.sin(angle - Math.PI / 2);
    doc.moveTo(doc.page.width / 2, gaugeY + 50)
      .lineTo(needleEndX, needleEndY)
      .stroke('red');
    doc.fontSize(10).text('0', doc.page.width / 2 - 55, gaugeY + 60);
    doc.text('48.25', doc.page.width / 2 + 40, gaugeY + 60);

    doc.moveDown(4);

    // Factors table
    doc.fontSize(12).text('Below is your personalised report based on your current health and lifestyle factors.');
    doc.moveDown();

    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidth = (doc.page.width - 100) / 2;

    doc.fillColor('#4CAF50').rect(tableLeft, tableTop, colWidth, 30).fill();
    doc.fillColor('#FF9800').rect(tableLeft + colWidth, tableTop, colWidth, 30).fill();

    doc.fillColor('white').text('Keep up the good work!', tableLeft + 10, tableTop + 10);
    doc.text('Room for improvement', tableLeft + colWidth + 10, tableTop + 10);

    doc.fillColor('black');
    let currentY = tableTop + 30;

    const addRow = (category, good, bad) => {
      doc.fontSize(10).text(category, tableLeft, currentY, { width: colWidth, bold: true });
      currentY += 20;
      if (good && good.length > 0) {
        good.forEach(item => {
          doc.text('✓ ' + item, tableLeft + 10, currentY, { width: colWidth - 20 });
          currentY += 20;
        });
      }
      if (bad && bad.length > 0) {
        bad.forEach(item => {
          doc.text('✗ ' + item, tableLeft + colWidth + 10, currentY - (good.length * 20), { width: colWidth - 20 });
          currentY += 20;
        });
      }
    };

    addRow('Demographic factor', [], demographicFactors);
    addRow('Medical risk factors', medicalRiskFactors.filter(f => f.startsWith('No') || f.startsWith('Good')), medicalRiskFactors.filter(f => f.startsWith('Having')));
    addRow('Lifestyle habits and diet', lifestyleHabits.filter(h => !h.startsWith('Low') && !h.startsWith('Eating')), lifestyleHabits.filter(h => h.startsWith('Low') || h.startsWith('Eating')));
    addRow('Environmental exposure', [], environmentalExposure);

    // Recommendations and footer on new pages will be handled similarly to your original code

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        const params = {
          Bucket: S3Bucket,
          Key: `report-${Date.now()}.pdf`,
          Body: pdfBuffer,
          ContentType: 'application/pdf'
        };

        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              statusCode: 200,
              body: JSON.stringify({ message: 'PDF generated and uploaded successfully', url: data.Location })
            });
          }
        });
      });
    });
  } catch (error) {
    console.log('An error occurred:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred', error: error.message })
    };
  }
};