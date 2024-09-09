import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

import { handler } from "../src/index"
import { mockedContext, getMockedEvent } from '../../__mocks__';
import { Stage } from "../../common";


const getEvent = () => getMockedEvent(JSON.stringify({
  "landlord": "email#audel91@gmail.com",
  "houseId": "4567",
  "houseFriendlyName": "houseInstaging",
  "address": "las perlas 2012",
  "details": "super nice house!",
  "landlords": [
    {
      "name": "Yolanda",
      "phone": "+15093120334"
    }
  ],
  "leaseStatus": "AVAILABLE",
  "tenants": [
    {
      "name": "Sergio",
      "phone": "+523121186656"
    }
  ]
}));

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("createHouse handler", () => {

  beforeEach(() => {
    ddbMock.reset();
  });

  it('creates a house', async () => {
    expect.assertions(4);
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

    const result = await handler(getEvent(), mockedContext, () => undefined)

    if (result) {
      expect(result.statusCode).toBe(200)
      expect(result.body).toBe("{\"message\":\"OK\"}")
      expect(result.headers).toMatchObject({ 'Content-Type': 'application/json' })
      expect(result.isBase64Encoded).toBe(false)
    }
  })

  it('creates a house in prod table', async () => {
    expect.assertions(4);
    ddbMock.on(PutCommand, {
      TableName: 'houses-prod',
    }).resolves({
      $metadata: {
        httpStatusCode: 200,
        requestId: '123',
        attempts: 1,
        totalRetryDelay: 0
      }
    })
    const event = getEvent()
    const result = await handler({
      ...event,
      requestContext: {
        ...event.requestContext,
        stage: Stage.PROD
      }
    }, mockedContext, () => undefined)

    if (result) {
      expect(result.statusCode).toBe(200)
      expect(result.body).toBe("{\"message\":\"OK\"}")
      expect(result.headers).toMatchObject({ 'Content-Type': 'application/json' })
      expect(result.isBase64Encoded).toBe(false)
    }

  })

  it('returns error en empty body', async () => {
    expect.assertions(4);
    const event = getEvent()
    const result = await handler({
      ...event,
      body: null
    }, mockedContext, () => undefined)

    if (result) {
      expect(result.statusCode).toBe(500)
      expect(result.body).toBe("{\"message\":\"EMPTY_BODY\"}")
      expect(result.headers).toMatchObject({ 'Content-Type': 'application/json' })
      expect(result.isBase64Encoded).toBe(false)
    }
  })

  it('handles db errors', async () => {
    expect.assertions(4);
    ddbMock.on(PutCommand, {
      TableName: 'houses',
    }).rejects("Something wrong happened")
    const event = getEvent()
    const result = await handler(getEvent(), mockedContext, () => undefined)

    if (result) {
      expect(result.statusCode).toBe(500)
      expect(result.body).toBe("{\"message\":\"HOUSE_NOT_CREATED\"}")
      expect(result.headers).toMatchObject({ 'Content-Type': 'application/json' })
      expect(result.isBase64Encoded).toBe(false)
    }
  })
});