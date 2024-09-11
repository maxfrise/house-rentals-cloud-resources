import { APIGatewayEvent, Handler } from 'aws-lambda';
import { StatusCodes, ApiResponse, getEnv } from '../../common';
import { Responsebody } from "./types"
import { House } from "../../common/types"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { createHouse } from './createHouse';

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler: Handler<APIGatewayEvent, ApiResponse<Responsebody>> = async (event) => {
  const environment = getEnv(event.requestContext.stage)
  const tableName = environment === "prod" ? 'houses-prod' : 'houses'

  if (!event.body) {
    return new ApiResponse(StatusCodes.error, { message: "EMPTY_BODY" })
  }

  const body = JSON.parse(event.body) as House
  const result = await createHouse(body, tableName, ddb)

  const status = result ? StatusCodes.ok : StatusCodes.error;
  const message = result ? "OK" : "HOUSE_NOT_CREATED";

  return new ApiResponse(status, { message })
};