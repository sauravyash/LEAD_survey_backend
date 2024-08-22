import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const data = JSON.parse(event.body || '{}');
  const params = {
    TableName: process.env.DYNAMODB_TABLE!,
    Item: {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      address: data.address,
      reuseDataConsent: data.reuseDataConsent,
      content: data.content,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create the item.' }),
    };
  }
};