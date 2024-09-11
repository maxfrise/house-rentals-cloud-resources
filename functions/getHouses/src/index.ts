import { APIGatewayEvent, Handler } from "aws-lambda";
import { StatusCodes, ApiResponse, getEnv } from "../../common";
import { Responsebody, Body } from "./types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getHouses } from "./getHouses";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler: Handler<
  APIGatewayEvent,
  ApiResponse<Responsebody>
> = async (event) => {
  const environment = getEnv(event.requestContext.stage);
  const tableName = environment === "prod" ? "houses-prod" : "houses";

  if (!event.body) {
    return new ApiResponse(StatusCodes.error, { message: "EMPTY_BODY" });
  }

  const body = JSON.parse(event.body) as Body;

  const result = await getHouses(body, tableName, ddb);

  if (!result) {
    return new ApiResponse(StatusCodes.notFound, { message: "NO_HOUSES" });
  }

  const houses = result.Items?.map((item) => item);

  return new ApiResponse(StatusCodes.ok, { houses });
};
