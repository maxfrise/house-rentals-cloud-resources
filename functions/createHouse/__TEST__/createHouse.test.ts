import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { createHouse } from "../src/createHouse"

const ddbMock = mockClient(DynamoDBDocumentClient);

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });


const body = {
  "landlord": "email#audel91@gmail.com",
  "houseId": "4567",
  "houseFriendlyName": "houseInstaging",
  "address": "las perlas 2012",
  "details": "super nice house!",
  "landlords": [
    {
      "name": "Yolanda",
      "phone": "+15093120388"
    }
  ],
  "leaseStatus": "AVAILABLE",
  "tenants": [
    {
      "name": "Sergio",
      "phone": "+523121186644"
    }
  ]
}

describe('createHouse', () => {

  beforeEach(() => {
    ddbMock.reset();
  });

  it('creates a house', async () => {
    ddbMock.on(PutCommand, {
      TableName: 'houses',
    }).resolves({
      $metadata: {
        httpStatusCode: 200,
        requestId: '123',
        attempts: 1,
        totalRetryDelay: 0
      }
    })

    const res = await createHouse(body, "houses", ddb)

    expect(res!.$metadata.httpStatusCode).toBe(200)
    expect(res!.$metadata.requestId).toBe('123')
    expect(res!.$metadata.attempts).toBe(1)
    expect(res!.$metadata.totalRetryDelay).toBe(0)
  })

  it('logs on db exception', async () => {
    ddbMock.on(PutCommand, {
      TableName: 'houses',
    }).rejects("Something wrong happened")

    await createHouse(body, "houses", ddb)

    expect(consoleSpy).toHaveBeenCalledOnce()
    expect(consoleSpy).toHaveBeenCalledWith("Unexpected error during house creation, Error: Something wrong happened")
  })

})