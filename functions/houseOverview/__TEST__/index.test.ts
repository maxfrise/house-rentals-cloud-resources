import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { handler } from "../src/index";
import { mockedContext, getMockedEvent } from "../../__mocks__";
import { Stage } from "../../common";

const ddbMock = mockClient(DynamoDBDocumentClient);

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

const getEvent = () =>
  getMockedEvent(
    JSON.stringify({
      user: "xxx@gmail.com",
      houseid: "123",
    }),
  );

describe("get house overview handler", () => {
  beforeEach(() => {
    ddbMock.reset();
    vi.clearAllMocks();
  });

  it("should get the overview", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "houses",
        ExpressionAttributeNames: {
          "#PK": "landlord",
          "#SK": "houseId",
        },
        ExpressionAttributeValues: {
          ":pk": "email#xxx@gmail.com",
          ":sk": "house#123",
        },
      })
      .resolves({
        Items: [houseDatails],
      })
      .on(QueryCommand, {
        TableName: "paymentJobs",
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

    const result = await handler(getEvent(), mockedContext, () => undefined);

    expect(result!.statusCode).toBe(200);
    expect(result!.body).toBe(
      '{"house":{"landlords":[{"name":"******","phone":"******"}],"tenants":[{"name":"******","phone":"******"}],"houseId":"******","houseFriendlyName":"******","landlord":"******@gmail.com","address":"******","details":"******","leaseStatus":"LEASED"},"payments":[{"landlords":[{"name":"******","phone":"******"}],"tenants":[{"name":"******","phone":"******"}],"st":"clhqcayfg000008mb78ug1z0t|2023-03-07T00:00:00.000Z|9255e3fe-1869-410c-b444-a17a03279860","houseid":"clhqcayfg000008mb78ug1z0t","status":"PAID","details":[{"method":"******","amount":"12000"}],"pk":"p#2023-03-07T00:00:00.000Z"}]}',
    );
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
  });

  it("should get the overview from prod", async () => {
    const event = getEvent();
    ddbMock
      .on(QueryCommand, {
        TableName: "houses-prod",
        ExpressionAttributeNames: {
          "#PK": "landlord",
          "#SK": "houseId",
        },
        ExpressionAttributeValues: {
          ":pk": "email#xxx@gmail.com",
          ":sk": "house#123",
        },
      })
      .resolves({
        Items: [houseDatails],
      })
      .on(QueryCommand, {
        TableName: "paymentJobs-prod",
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

    const result = await handler(
      {
        ...event,
        requestContext: {
          ...event.requestContext,
          stage: Stage.PROD,
        },
      },
      mockedContext,
      () => undefined,
    );

    expect(result!.statusCode).toBe(200);
    expect(result!.body).toBe(
      '{"house":{"landlords":[{"name":"******","phone":"******"}],"tenants":[{"name":"******","phone":"******"}],"houseId":"******","houseFriendlyName":"******","landlord":"******@gmail.com","address":"******","details":"******","leaseStatus":"LEASED"},"payments":[{"landlords":[{"name":"******","phone":"******"}],"tenants":[{"name":"******","phone":"******"}],"st":"clhqcayfg000008mb78ug1z0t|2023-03-07T00:00:00.000Z|9255e3fe-1869-410c-b444-a17a03279860","houseid":"clhqcayfg000008mb78ug1z0t","status":"PAID","details":[{"method":"******","amount":"12000"}],"pk":"p#2023-03-07T00:00:00.000Z"}]}',
    );
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
  });

  it("returns error on empty body", async () => {
    const event = getEvent();
    ddbMock
      .on(QueryCommand, {
        TableName: "houses",
        ExpressionAttributeNames: {
          "#PK": "landlord",
          "#SK": "houseId",
        },
        ExpressionAttributeValues: {
          ":pk": "email#xxx@gmail.com",
          ":sk": "house#123",
        },
      })
      .resolves({
        Items: [houseDatails],
      })
      .on(QueryCommand, {
        TableName: "paymentJobs",
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

    const result = await handler(
      {
        ...event,
        body: null,
      },
      mockedContext,
      () => undefined,
    );

    expect(result!.statusCode).toBe(500);
    expect(result!.body).toBe('{"message":"EMPTY_BODY"}');
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
  });
});
