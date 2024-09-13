import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);
const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

import { getPayments } from "../src/getPayments";
const paymentsItem = {
  payments: [
    {
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
      st: "clhqcayfg000008mb78ug1z0t|2023-03-07T00:00:00.000Z|9255e3fe-1869-410c-b444-a17a03279860",
      houseid: "clhqcayfg000008mb78ug1z0t",
      status: "PAID",
      details: [
        {
          method: "******",
          amount: "12000",
        },
      ],
      pk: "p#2023-03-07T00:00:00.000Z",
    },
  ],
};

const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("getPayments", () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.clearAllMocks();
  });

  it("gets the payments", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "payments",
        ExpressionAttributeValues: {
          ":houseid": {
            S: "123",
          },
        },
        KeyConditionExpression: "houseid = :houseid",
        IndexName: "houseid-pk-index",
      })
      .resolves({
        Items: [paymentsItem],
      });

    const payments = await getPayments("123", "payments", ddb);

    expect(payments).toMatchObject(paymentsItem.payments);
  });

  it("returns undefined on empty payments", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "payments",
        ExpressionAttributeValues: {
          ":houseid": {
            S: "123",
          },
        },
        KeyConditionExpression: "houseid = :houseid",
        IndexName: "houseid-pk-index",
      })
      .resolves({
        Items: [],
      });

    const payments = await getPayments("123", "payments", ddb);

    expect(payments).toBeUndefined();
  });

  it("handles db errors", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "payments",
        ExpressionAttributeValues: {
          ":houseid": {
            S: "123",
          },
        },
        KeyConditionExpression: "houseid = :houseid",
        IndexName: "houseid-pk-index",
      })
      .rejects("something wrong happened");

    const payments = await getPayments("123", "payments", ddb);

    expect(payments).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected error while getting the house, Error: something wrong happened",
    );
  });
});
