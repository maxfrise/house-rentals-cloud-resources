import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { getHouses } from "../src/getHouses";

const ddbMock = mockClient(DynamoDBDocumentClient);

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

const body = {
  landlord: "email#audel91@gmail.com",
};

describe("getHouses", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("should get the houses by user", async () => {
    expect.assertions(2);
    ddbMock
      .on(QueryCommand, {
        TableName: "houses",
        KeyConditionExpression: "#hk = :landlord",
        ExpressionAttributeNames: {
          "#hk": "landlord",
        },
      })
      .resolves({
        Items: [
          {
            houseId: "house#clhqcayfg000008mb78ug1z0t",
          },
        ],
      });

    const result = await getHouses(body, "houses", ddb);

    if (result) {
      expect(result?.Items?.length).toBe(1);
      expect(result?.Items?.[0].houseId).toBe(
        "house#clhqcayfg000008mb78ug1z0t",
      );
    }
  });
});
