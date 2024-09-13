import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const getHouse = async (
  user: string,
  houseid: string,
  table: string,
  dbClient: DynamoDBClient,
) => {
  try {
    const command = new QueryCommand({
      TableName: table,
      KeyConditionExpression: "#PK = :pk AND #SK = :sk",
      ExpressionAttributeNames: {
        "#PK": "landlord",
        "#SK": "houseId",
      },
      ExpressionAttributeValues: {
        ":pk": `email#${user}`,
        ":sk": `house#${houseid}`,
      },
    });
    const data = await dbClient.send(command);

    return data?.Items?.[0].house;
  } catch (e) {
    console.log(`Unexpected error while getting the house, ${e}`);
  }
};
