import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

import { ApiResponse, Event, MaxfriseErrorCodes } from '../../../common';
import { AgenciesRequest, AgenciesResponse } from "../types";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const addAgency = async (event: Event<AgenciesRequest>): Promise<ApiResponse<AgenciesResponse>> => {
  const tableName = event.environment === "prod" ? "agencies-prod-table" : "agencies-test-table";
  const date = new Date();
  const agencyId = `${date.getTime()}-${event.body.ownerId}`;

  const newItemCommand = new PutCommand({
    Item: {
      agencyId: {
        S: agencyId
      },
      owner: {
        S: event.body.ownerId
      },
      address: {
        S: event.body.address || ""
      },
      name: {
        S: event.body.name || ""
      },
      phone: {
        S: event.body.phone || ""
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
