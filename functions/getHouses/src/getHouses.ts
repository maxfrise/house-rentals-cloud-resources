
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Body } from "./types"

export const getHouses = async (body: Body, tableName: string, client: DynamoDBClient) => {
  const queryCommnad = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "#hk = :landlord",
    ExpressionAttributeNames: {
      "#hk": "landlord",
    },
    ExpressionAttributeValues: {
      ":landlord": body.landlord
    },
  })

  try {
    return await client.send(queryCommnad);
  } catch (e) {
    console.log(`Unexpected error while getting the houses, ${e}`)
  }
}