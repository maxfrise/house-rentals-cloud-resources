import { APIGatewayEvent, Handler } from "aws-lambda";
import { StatusCodes, ApiResponse, getEnv } from "../../common";
import { Responsebody, Body } from "./types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getHouse } from "./getHouse";
import { getPayments } from "./getPayments";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler: Handler<
  APIGatewayEvent,
  ApiResponse<Responsebody>
> = async (event) => {
  const environment = getEnv(event.requestContext.stage);
  const houseTableName = environment === "prod" ? "houses-prod" : "houses";
  const paymentJobsTableName =
    environment === "prod" ? "paymentJobs-prod" : "paymentJobs";

  if (!event.body) {
    return new ApiResponse(StatusCodes.error, { message: "EMPTY_BODY" });
  }

  const body = JSON.parse(event.body) as Body;

  const house = await getHouse(body.user, body.houseid, houseTableName, ddb);
  const payments = await getPayments(body.houseid, paymentJobsTableName, ddb);

  return new ApiResponse(StatusCodes.ok, { house, payments });
};
