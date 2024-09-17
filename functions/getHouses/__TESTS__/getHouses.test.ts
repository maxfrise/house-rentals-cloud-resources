import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { getHouses } from "../src/getHouses";

const ddbMock = mockClient(DynamoDBDocumentClient);

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

describe("getHouses", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("should get the houses by user", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "houses",
        KeyConditionExpression: "#hk = :landlord",
        ExpressionAttributeNames: {
          "#hk": "landlord",
        },
        ExpressionAttributeValues: {
          ":landlord": "email#audel91@gmail.com",
        },
      })
      .resolves({
        Items: [
          {
            houseId: "house#clhqcayfg000008mb78ug1z0t",
          },
        ],
      });

    const result = await getHouses("email#audel91@gmail.com", "houses", ddb);

    expect(result?.Items?.length).toBe(1);
    expect(result?.Items?.[0].houseId).toBe("house#clhqcayfg000008mb78ug1z0t");
  });
});
