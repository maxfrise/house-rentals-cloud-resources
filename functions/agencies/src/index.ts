import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Agencies function",
    }),
  };
};