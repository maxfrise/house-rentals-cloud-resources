import { Handler, } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Event, Response, StatusCodes, defaultResponse } from '../../common';
import type { PaymentCollectorRequest } from "./event";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler: Handler<Event<PaymentCollectorRequest>, Response> = async (event) => {
  const body = event.body
  const tableName = event.environment === "prod" ? "paymentJobs-prod" : "paymentJobs"

  if (!await paymentExist(body.pk, body.sk, tableName)) {
    return {
      ...defaultResponse,
      statusCode: StatusCodes.notFound,
      body: JSON.stringify({ message: 'payment not found' })
    }
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
    await ddb.send(command)
  } catch (error) {
    return {
      ...defaultResponse,
      statusCode: StatusCodes.error,
      body: JSON.stringify({ message: (error as Error).message })
    }
  }
  return {
    ...defaultResponse,
    statusCode: StatusCodes.ok,
    body: JSON.stringify({
      message: 'Rent collected successfully'
    })
  };
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
    console.log("Error querying the db")
  }

  return exist
}