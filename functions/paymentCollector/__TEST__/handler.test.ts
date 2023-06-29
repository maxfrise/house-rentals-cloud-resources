import { handler } from "../src/index"
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Event } from '../../common';
import { PaymentCollectorRequest } from "../src/event";
import { mockedContext } from '../../__mocks__';

const event: Event<PaymentCollectorRequest> = {
  environment: 'test',
  body: {
    pk: '123',
    sk: '234',
    details: 'cool details'
  }
}

describe("paymentCollector", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);

  function mockDB(tableName: string, pk: string, sk: string) {

    ddbMock.on(QueryCommand, {
      TableName: tableName,
      ExpressionAttributeValues: {
        ":pk": {
          "S": pk
        },
        ":sk": {
          "S": sk
        }
      }
    }).resolves({
      Items: [
        {
          "pk": "123",
          "st": "345",
          "details": [
            {
              "amount": "12000",
              "method": ""
            }
          ],
          "status": "DUE",
        }
      ]
    }).on(UpdateCommand, { TableName: tableName }).resolves({
      $metadata: {
        httpStatusCode: 200
      }
    });
  }

  afterEach(() => {
    ddbMock.reset();
  })

  it('should collect payment on test', async () => {
    mockDB('paymentJobs', '123', '234')
    const result = await handler(event, mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"Rent collected successfully\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 200,
    });
  })

  it('should collect payment on prod', async () => {
    mockDB('paymentJobs-prod', '123', '234')
    const result = await handler({
      ...event,
      environment: 'prod'
    }, mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"Rent collected successfully\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 200,
    });
  })

  it('should handle invalid payments', async () => {
    mockDB('paymentJobs-prod', 'invalid', 'invalid')
    const result = await handler(event, mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"payment not found\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 404,
    });
  })

  it('should handle errors trying to update the db', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{}] })
      .on(UpdateCommand)
      .rejects("the DB could not be updated")
    const result = await handler(event, mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"the DB could not be updated\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 500,
    });
  })
});