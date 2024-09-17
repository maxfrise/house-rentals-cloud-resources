import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const getHouses = async (
  landlord: string,
  tableName: string,
  client: DynamoDBClient,
) => {
  const queryCommnad = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "#hk = :landlord",
    ExpressionAttributeNames: {
      "#hk": "landlord",
    },
    ExpressionAttributeValues: {
      ":landlord": landlord,
    },
  });

  try {
    return await client.send(queryCommnad);
  } catch (e) {
    console.log(`Unexpected error while getting the houses, ${e}`);
  }
};
