import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { handler } from "../src/index";
import { mockedContext, getMockedEvent } from "../../__mocks__";
import { Stage } from "../../common";

const getEvent = () =>
  getMockedEvent(null, Stage.TEST, {
    landlord: "email#audel91@gmail.com",
  });

const ddbMock = mockClient(DynamoDBDocumentClient);

const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("get houses handler", async () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("should get houses", async () => {
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

    const result = await handler(getEvent(), mockedContext, () => undefined);

    expect(result!.statusCode).toBe(200);
    expect(result!.body).toBe(
      '{"houses":[{"houseId":"house#clhqcayfg000008mb78ug1z0t"}]}',
    );
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
  });

  it("should get houses from prod", async () => {
    const event = getEvent();
    ddbMock
      .on(QueryCommand, {
        TableName: "houses-prod",
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
      '{"houses":[{"houseId":"house#clhqcayfg000008mb78ug1z0t"}]}',
    );
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
  });

  it("handles not houses found", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "INVALID_TABLE",
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

    const result = await handler(getEvent(), mockedContext, () => undefined);

    expect(result!.statusCode).toBe(404);
    expect(result!.body).toBe('{"message":"NO_HOUSES"}');
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
  });

  it("returns error on empty query param", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "INVALID_TABLE",
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
    const result = await handler(
      getMockedEvent(),
      mockedContext,
      () => undefined,
    );

    expect(result!.statusCode).toBe(400);
    expect(result!.body).toBe('{"message":"EMPTY_VALUE"}');
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
  });

  it("handles db errors", async () => {
    ddbMock
      .on(QueryCommand, {
        TableName: "houses",
        KeyConditionExpression: "#hk = :landlord",
        ExpressionAttributeNames: {
          "#hk": "landlord",
        },
      })
      .rejects("Something wrong happened");
    const result = await handler(getEvent(), mockedContext, () => undefined);

    expect(result!.statusCode).toBe(404);
    expect(result!.body).toBe('{"message":"NO_HOUSES"}');
    expect(result!.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result!.isBase64Encoded).toBe(false);
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected error while getting the houses, Error: Something wrong happened",
    );
  });
});
