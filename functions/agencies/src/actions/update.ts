import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { ApiResponse, MaxfriseErrorCodes, Stage } from "../../../common";
import { AgenciesRequest, AgenciesResponse } from "../types";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const updateAgency = async (
  request: AgenciesRequest,
  environment: Stage,
): Promise<ApiResponse<AgenciesResponse>> => {
  const tableName =
    environment === "prod" ? "agencies-prod-table" : "agencies-test-table";

  if (!request.agencyId || !request.ownerId) {
    return new ApiResponse<AgenciesResponse>(
      MaxfriseErrorCodes.missingInfo.code,
      {
        response: {
          errorMessage: MaxfriseErrorCodes.missingInfo.message,
        },
      },
    );
  }

  const updateItemCommand = new UpdateCommand({
    ExpressionAttributeNames: {
      "#n": "name",
      "#a": "address",
      "#p": "phone",
    },
    ExpressionAttributeValues: {
      ":address": request.address,
      ":name": request.name,
      ":phone": request.phone,
    },
    Key: {
      agencyId: request.agencyId,
      owner: request.ownerId,
    },
    ReturnValues: "NONE",
    TableName: tableName,
    UpdateExpression: "SET #a = :address, #n = :name, #p = :phone",
  });

  try {
    await ddb.send(updateItemCommand);
  } catch (e) {
    console.error("Error on update command execution");
    console.error(e);

    return new ApiResponse<AgenciesResponse>(
      MaxfriseErrorCodes.errorFromDynamo.code,
      {
        response: {
          errorMessage: MaxfriseErrorCodes.errorFromDynamo.message,
        },
      },
    );
  }

  return new ApiResponse<AgenciesResponse>(
    200,
    {
      response: {
        agencyId: request.agencyId,
      },
    },
    {},
  );
};
