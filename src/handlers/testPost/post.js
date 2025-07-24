exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'POST successful', body: JSON.parse(event.body) }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
      'Access-Control-Allow-Methods': 'OPTIONS,POST'
    },
  };
}