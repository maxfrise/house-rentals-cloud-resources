import { APIGatewayEvent, Handler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { StatusCodes, ApiResponse, getEnv, Stage, MaxfriseErrorCodes } from '../../common';
import type { PaymentCollectorRequest, Responsebody } from "./event";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler: Handler<APIGatewayEvent, ApiResponse<PaymentCollectorRequest>> = async (event) => {
  if (!event.body) return new ApiResponse<Responsebody>(StatusCodes.badRequest, { message: MaxfriseErrorCodes.missingInfo.message })
  const body = JSON.parse(event.body) as PaymentCollectorRequest
  const environment = getEnv(event.requestContext.stage)
  const tableName = environment === Stage.PROD ? "paymentJobs-prod" : "paymentJobs"

  if (!await paymentExist(body.pk, body.sk, tableName)) {
    return new ApiResponse<Responsebody>(StatusCodes.notFound, { message: 'payment not found' })
  }

  const input = {
    "ExpressionAttributeNames": {
      "#S": "status",
      "#DT": "details"
    },
    "ExpressionAttributeValues": {
      ":s": "PAID",
      ":dt": body.details
    },
    "Key": {
      "pk": body.pk,
      "st": body.sk
    },
    "ReturnValues": "ALL_NEW",
    "TableName": tableName,
    "UpdateExpression": "SET #S = :s, #DT = :dt"
  };

  const command = new UpdateCommand(input);

  try {
    await ddb.send(command)
  } catch (error) {
    return new ApiResponse<Responsebody>(StatusCodes.error, { message: (error as Error).message })
  }

  return new ApiResponse<Responsebody>(StatusCodes.ok, { message: "Rent collected successfully" })
};

async function paymentExist(pk: string, sk: string, tableName: string) {
  let exist = false
  const input = {
    "ExpressionAttributeValues": {
      ":pk": pk,
      ":sk": sk
    },
    "KeyConditionExpression": "pk = :pk AND st = :sk",
    "TableName": tableName
  };

  try {
    const response = await ddb.send(new QueryCommand(input))
    exist = response.Items!.length > 0
  } catch (e) {
    console.log("Error querying the db")
  }

  return exist
}