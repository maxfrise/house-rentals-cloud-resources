
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { marshall } from "@aws-sdk/util-dynamodb";

import { Body } from "./types"

export const createHouse = async (body: Body, tableName: string, client: DynamoDBClient) => {
  const putItemCommand = new PutCommand({
    TableName: tableName,
    Item: {
      houseId: body.houseId,
      landlord: body.landlord,
      address: body.address,
      details: body.details,
      leaseStatus: body.leaseStatus,
      houseFriendlyName: body.houseFriendlyName,
      tenants: body.tenants,
      landlords: body.landlords
    }
  })

  try {
    return await client.send(putItemCommand);
  } catch (e) {
    console.log(`Unexpected error during house creation, ${e}`)
  }
}