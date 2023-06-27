import { handler } from "../src/index"
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { Event } from "../src/event";

const event: Event = {
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
    const result = await handler(event)
    expect(result).toStrictEqual({
      statusCode: 200,
      message: 'Rent collected successfully'
    });
  })

  it('should collect payment on prod', async () => {
    mockDB('paymentJobs-prod', '123', '234')
    const result = await handler({
      ...event,
      environment: 'prod'
    })
    expect(result).toStrictEqual({
      statusCode: 200,
      message: 'Rent collected successfully'
    });
  })


  it('should throw an exception when payment is not found', async () => {
    mockDB('paymentJobs-prod', 'invalid', 'invalid')
    await expect(() => handler({
      ...event,
      environment: 'prod'
    })).rejects.toThrowError('Payment does not exisist!');
  })

  it('should throw an exception when failing to update the db', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [{}] })
      .on(UpdateCommand)
      .rejects("Error")
    await expect(() => handler(event)).rejects.toThrowError('Error: Error');
  })
});