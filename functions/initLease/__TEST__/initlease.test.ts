import { handler } from "../src/index"
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockedContext, getMockedEvent } from '../../__mocks__';
import { Stage } from '../../common';

const getEvent = (user = 'Eldon_Lesch0@example.com') => getMockedEvent(JSON.stringify({
  user,
  "houseid": "clie2mh930000f9q1hs7xft1u",
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
}));

describe("initLease", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);

  function mockDB(
    tableName: string = 'houses',
    leaseStatus = "AVAILABLE",
    rejectsQuery = false,
    rejectsPut = false,
    rejectsUpdate = false
  ) {

    if (rejectsQuery) {
      return ddbMock.on(QueryCommand).rejects('Error saving data in DB')
    }

    if (rejectsPut) {
      return ddbMock
        .on(QueryCommand)
        .resolves({ Items: [{ leaseStatus }] })
        .on(PutCommand).rejects('Error updating data in DB')
    }

    if (rejectsUpdate) {
      return ddbMock
        .on(QueryCommand)
        .resolves({ Items: [{ leaseStatus }] })
        .on(UpdateCommand)
        .rejects('Error updating house status')
    }

    ddbMock.on(QueryCommand, {
      TableName: tableName,
      KeyConditionExpression: "#PK = :pk AND #SK = :sk",
      ExpressionAttributeNames: {
        "#PK": "landlord",
        "#SK": "houseId"
      },
      ExpressionAttributeValues: {
        ":pk": `email#Eldon_Lesch0@example.com`,
        ":sk": `house#clie2mh930000f9q1hs7xft1u`
      }
    })
      .resolves({
        Items: [
          {
            "landlord": "email#Eldon_Lesch0@example.com",
            "houseId": "house#clie2mh930000f9q1hs7xft1u",
            "address": "618 Moore Walk",
            "details": "Tenetur ut recusandae nesciunt repellendus corporis. Optio laudantium ipsa voluptatibus.",
            "houseFriendlyName": "Lionhead",
            "landlords": [
              {
                "name": "Maureen",
                "phone": "+523120913105"
              }
            ],
            leaseStatus,
            "tenants": [
              {
                "name": "Alivia",
                "phone": "+523123061547"
              }
            ]
          }
        ]
      })
      .on(PutCommand).resolves({})
      .on(UpdateCommand, { TableName: tableName }).resolves({})
  }

  afterEach(() => {
    ddbMock.reset();
  })

  it('should init lease', async () => {
    mockDB()
    const result = await handler(getEvent(), mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"Lease initialized\",\"isUserOwner\":true,\"houseAvailable\":true,\"jobsCreated\":12}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 200,
    });
  })

  it('should init lease in prod', async () => {
    mockDB('houses-prod')
    const event = getEvent()
    const result = await handler({
      ...event,
      requestContext: {
        ...event.requestContext,
        stage: Stage.PROD
      }
    }, mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"Lease initialized\",\"isUserOwner\":true,\"houseAvailable\":true,\"jobsCreated\":12}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 200,
    });
  })

  it('handles user not an owner of the house', async () => {
    mockDB()
    const result = await handler(getEvent('invalid'), mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"The user is not the owner of the house\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 400,
    });
  })

  it('handles house not available', async () => {
    mockDB(undefined, 'LEASED')
    const result = await handler(getEvent(), mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"The house is not avaible to be leased\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 400,
    });
  })

  it('handles request with empty body', async () => {
    const event = getMockedEvent('');
    const result = await handler(event, mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"MISSING_INFO\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 400,
    });
  })

  it('handles error validating house', async () => {
    mockDB('houses', "AVAILABLE", true)
    const result = await handler(getEvent(), mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"Error saving data in DB\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 400,
    });
  })

  it('handles error on creating jobs', async () => {
    mockDB('houses', "AVAILABLE", false, true)
    const result = await handler(getEvent(), mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"Error updating data in DB\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 400,
    });
  })

  it('handles error updating house status', async () => {
    mockDB('houses', "AVAILABLE", false, false, true)
    const result = await handler(getEvent(), mockedContext, () => undefined)
    expect(result).toMatchObject({
      body: "{\"message\":\"Error updating house status\"}",
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false,
      statusCode: 400,
    });
  })

});