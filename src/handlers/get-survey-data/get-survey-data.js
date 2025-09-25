const awsSDK = require('aws-sdk');
const { DynamoDB } = awsSDK;

// Check if we're running in a Lambda environment or locally
const isLocal = process.env.IS_OFFLINE;

const DynamoDBTable = process.env.DYNAMODB_TABLE || 'Reports';

async function scanAllItems(dynamoDb, tableName) {
  let ExclusiveStartKey = undefined;
  const allItems = [];
  
  do {
    const params = {
      TableName: tableName,
      // optional: ProjectionExpression, FilterExpression, etc.
      ExclusiveStartKey,
    };
    
    const { Items, LastEvaluatedKey } = await dynamoDb.scan(params).promise();
    allItems.push(...Items);
    ExclusiveStartKey = LastEvaluatedKey;
  } while (ExclusiveStartKey);
  
  return allItems;
}

exports.handler = async (event) => {
  try {
    const dynamoDb = new DynamoDB.DocumentClient();
    const items = await scanAllItems(dynamoDb, DynamoDBTable);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data retrieved successfully', data: items }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
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
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
      },
    };
  }
};