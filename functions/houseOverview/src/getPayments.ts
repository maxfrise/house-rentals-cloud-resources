import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const getPayments = async (
  houseid: string,
  table: string,
  dbClient: DynamoDBClient,
) => {
  try {
    const command = new QueryCommand({
      ExpressionAttributeValues: {
        ":houseid": {
          S: houseid,
        },
      },
      KeyConditionExpression: "houseid = :houseid",
      IndexName: "houseid-pk-index",
      TableName: table,
    });

    const data = await dbClient.send(command);

    const payments = data?.Items?.[0].payments;

    return payments;
  } catch (e) {
    console.log(`Unexpected error while getting the house, ${e}`);
  }
};
