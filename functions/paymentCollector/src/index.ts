import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { Event } from "./event";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event: Event) => {
  const body = event.body
  const tableName = event.environment === "prod" ? "paymentJobs-prod" : "paymentJobs"
  let message = "Unknow status"
  let statusCode: number | undefined = 200

  if (!await paymentExist(body.pk, body.sk, tableName)) {
    throw new Error("Payment does not exisist!")
  }

  const input = {
    "ExpressionAttributeNames": {
      "#S": "status",
      "#DT": "details"
    },
    "ExpressionAttributeValues": {
      ":s": {
        "S": "PAID"
      },
      ":dt": {
        "M": marshall(body.details)
      }
    },
    "Key": {
      "pk": {
        "S": body.pk
      },
      "st": {
        "S": body.sk
      }
    },
    "ReturnValues": "ALL_NEW",
    "TableName": tableName,
    "UpdateExpression": "SET #S = :s, #DT = :dt"
  };

  const command = new UpdateCommand(input);

  try {
    const result = await ddb.send(command)
    statusCode = result.$metadata.httpStatusCode
    message = "Rent collected successfully"

  } catch (error) {
    message = "Unexpected error occured, verify the logs"
    throw new Error(error as string)
  }

  const response = {
    statusCode,
    message
  };

  return response;
};

async function paymentExist(pk: string, sk: string, tableName: string) {
  let exist = false
  const input = {
    "ExpressionAttributeValues": {
      ":pk": {
        "S": pk
      },
      ":sk": {
        "S": sk
      }
    },
    "KeyConditionExpression": "pk = :pk AND st = :sk",
    "TableName": tableName
  };

  try {
    const response = await ddb.send(new QueryCommand(input))
    exist = response.Items!.length > 0
  } catch (e) {
    console.log("Error quering the db")
  }

  return exist
}