import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

import { ApiResponse, Event, MaxfriseErrorCodes, Stage } from '../../../common';
import { AgenciesRequest, AgenciesResponse } from "../types";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const addAgency = async (request: AgenciesRequest, environment: Stage): Promise<ApiResponse<AgenciesResponse>> => {
  const tableName = environment === "prod" ? "agencies-prod-table" : "agencies-test-table";
  const date = new Date();
  const agencyId = `${date.getTime()}-${request.ownerId}`;

  const newItemCommand = new PutCommand({
    Item: {
      agencyId: {
        S: agencyId
      },
      owner: {
        S: request.ownerId
      },
      address: {
        S: request.address || ""
      },
      name: {
        S: request.name || ""
      },
      phone: {
        S: request.phone || ""
      }
    },
    TableName: tableName
  });

  let result;
  try {
    result = await ddb.send(newItemCommand);
  } catch (e) {
    console.error('Error on put command execution');
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

  if (result?.$metadata?.httpStatusCode !== 200) {
    console.error('Error on dynamo DB');

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
      agencyId
    }
  }, {});
};
