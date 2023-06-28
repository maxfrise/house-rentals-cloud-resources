import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

import { Event } from '../../../common';
import { AgenciesRequest } from "../types";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const addAgency = async (event: Event<AgenciesRequest>): Promise<string | null> => {
  const tableName = event.environment === "prod" ? "agencies-prod-table" : "agencies-test-table"
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

  try {
    await ddb.send(newItemCommand);
  } catch (e) {
    console.error('Error on put command execution');
    console.log(e);

    return null;
  }

  return agencyId;
};
