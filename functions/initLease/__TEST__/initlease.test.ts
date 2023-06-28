import { handler } from "../src/index"
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { Event } from "../src/event";

export const event: Event = {
  environment: 'test',
  body: {
    "user": "audel91@gmail.com",
    "houseid": "clggukphp0000zlw958vz113s",
    "startDate": "2023-05-05",
    "term": "12",
    "rentAmount": "12000",
    "landlords": [
      {
        "name": "Yolanda",
        "phone": "+15093120388"
      }
    ],
    "tenants": [
      {
        "name": "Javier",
        "phone": "+523121186644"
      },
      {
        "name": "Audel",
        "phone": "+14254771367"
      }
    ]
  }
}

describe("initLease", () => {
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

  it('should init lease', async () => {
  })

  it('should throw an exception when trying to access other user data', async () => {
  })

  it('should throw an exception when the propertie is not avaible', async () => {
  })

  it('should create jobs based on the term of the lease', async () => {

  })

  it('should update the house status', () => {

  })

});