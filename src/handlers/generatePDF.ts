import { APIGatewayProxyHandler } from 'aws-lambda';
import PDFDocument from 'pdfkit';
import { S3 } from 'aws-sdk';

interface QuestionAnswer {
  question_number: number;
  question: string;
  answer: string;
}

interface RequestBody {
  data: QuestionAnswer[];
  title?: string;
}

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse the incoming request body
    const { data, title }: RequestBody = JSON.parse(event.body || '{}');

    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid input: data must be an array of questions and answers');
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Pipe the PDF content to a buffer
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: any) => buffers.push(chunk));
    doc.on('end', () => {});

    // Add title to the PDF
    doc.fontSize(18).text(title || 'Questionnaire Responses', { align: 'center' } as any);
    doc.moveDown();

    // Add content to the PDF
    data.forEach((item: QuestionAnswer) => {
      doc.fontSize(12).text(`Question ${item.question_number}: ${item.question}`, { bold: true } as any);
      doc.fontSize(10).text(`Answer: ${item.answer}`);
      doc.moveDown();
    });

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be fully generated
    await new Promise<void>((resolve) => doc.on('end', resolve));

    // Combine the buffers into a single buffer
    const pdfBuffer = Buffer.concat(buffers);

    // Generate a unique filename
    const filename = `questionnaire_${Date.now()}.pdf`;

    // Upload the PDF to S3
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filename,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    }).promise();

    // Generate a pre-signed URL for the uploaded PDF
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filename,
      Expires: 60 * 60 * 1 // URL expires in 1 hour
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate PDF' })
    };
  }
};