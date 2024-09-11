// src/handlers/ping/ping.js
var handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Serverless is mingin! Your function executed successfully!",
        input: event
      },
      null,
      2
    )
  };
};
export {
  handler
};
//# sourceMappingURL=ping.js.map
