import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { ApiResponse, MaxfriseErrorCodes, Stage } from '../../../common';
import { AgenciesRequest, AgenciesResponse, AgencyStatus } from "../types";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const updateAgencyStatus = async (request: AgenciesRequest, environment: Stage): Promise<ApiResponse<AgenciesResponse>> => {
  const tableName = environment === "prod" ? "agencies-prod-table" : "agencies-test-table";

  if (!request.agencyId || !request.ownerId || !request.status) {
    return new ApiResponse<AgenciesResponse>(
      MaxfriseErrorCodes.missingInfo.code,
      {
        response: {
          errorMessage: MaxfriseErrorCodes.missingInfo.message
        }
      }
    );
  }

  const updateItemCommand = new UpdateCommand({
    ExpressionAttributeNames: {
      "#s": "status",
    },
    ExpressionAttributeValues: {
      ":status": request.status,
    },
    Key: {
      agencyId: request.agencyId,
      owner: request.ownerId // TODO: Instead of using the owner id from request, get from logged user
    },
    ReturnValues: "NONE",
    TableName: tableName,
    UpdateExpression: "SET #s = :status",
  });

  let result;
  try {
    result = await ddb.send(updateItemCommand);
  } catch (e) {
    console.error('Error on update command execution');
    console.error(e);

    return new ApiResponse<AgenciesResponse>(
      MaxfriseErrorCodes.errorFromDynamo.code,
      {
        response: {
          errorMessage: MaxfriseErrorCodes.errorFromDynamo.message
        }
      }
    );
  }

  return new ApiResponse<AgenciesResponse>(200, {
    response: {
      agencyId: request.agencyId
    }
  }, {});
};
