import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { getHouse } from "../src/getHouse";

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

const houseDatails = {
  house: {
    landlords: [
      {
        name: "******",
        phone: "******",
      },
    ],
    tenants: [
      {
        name: "******",
        phone: "******",
      },
    ],
    houseId: "******",
    houseFriendlyName: "******",
    landlord: "******@gmail.com",
    address: "******",
    details: "******",
    leaseStatus: "LEASED",
  },
};

const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("getHouse", () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.clearAllMocks();
  });

  it("gets the house", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "house-overview",
        ExpressionAttributeNames: {
          "#PK": "landlord",
          "#SK": "houseId",
        },
        ExpressionAttributeValues: {
          ":pk": `email#audel91`,
          ":sk": `house#123`,
        },
      })
      .resolves({
        Items: [houseDatails],
      });
    const house = await getHouse("audel91", "123", "house-overview", ddb);

    expect(house).toMatchObject(houseDatails.house);
  });

  it("returns undefined on empty house", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "house-overview",
        ExpressionAttributeNames: {
          "#PK": "landlord",
          "#SK": "houseId",
        },
        ExpressionAttributeValues: {
          ":pk": `email#audel91`,
          ":sk": `house#123`,
        },
      })
      .resolves({
        Items: [],
      });
    const house = await getHouse("audel91", "123", "house-overview", ddb);

    expect(house).toBeUndefined();
  });

  it("handles db errors", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "house-overview",
        ExpressionAttributeNames: {
          "#PK": "landlord",
          "#SK": "houseId",
        },
        ExpressionAttributeValues: {
          ":pk": `email#audel91`,
          ":sk": `house#123`,
        },
      })
      .rejects("something wrong happened");

    const house = await getHouse("audel91", "123", "house-overview", ddb);

    expect(house).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected error while getting the house, Error: something wrong happened",
    );
  });
});
