import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { vi } from 'vitest';

import { handler } from '../src';
import { mockedContext } from '../../common/mocks';
import { Event, MaxfriseErrorCodes, Response, StatusCodes } from '../../common';
import { AgenciesRequest, AgenciesResponse } from '../src/types';

const mockedEvent: Event<AgenciesRequest> = {
  body: {
    action: 'CREATE',
    address: 'Some address',
    name: 'My agency',
    ownerId: 'owner#email',
    phone: '1234567890'
  },
  environment: 'test'
};

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockDB = (tableName: string, rejects = false, item = null) => {
  if (rejects) {
    return ddbMock.on(PutCommand, { TableName: tableName }).rejects('Some dynamo error');
  }

  return ddbMock.on(PutCommand, item || { TableName: tableName }).resolves({
    $metadata: {
      httpStatusCode: 200
    }
  });
}

describe('agencies handler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    ddbMock.reset();
  });

  describe('Success', () => {
    it('Should execute creation correctly', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date);

      mockDB('agencies-test-table');

      const response = await handler(mockedEvent, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(JSON.parse(response.body).response.agencyId).toBe(`${date.getTime()}-${mockedEvent.body.ownerId}`);
    });

    it('Should execute creation correctly when optional values are not present', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date);
      const event = { ...mockedEvent, body: { ...mockedEvent.body, address: undefined, name: null, phone: null } }
      mockDB('agencies-test-table');

      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(JSON.parse(response.body).response.agencyId).toBe(`${date.getTime()}-${mockedEvent.body.ownerId}`);
    });

    it('Should execute creation correctly when is prod', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date);

      mockDB('agencies-prod-table');

      const response = await handler({ ...mockedEvent, environment: 'prod' }, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(JSON.parse(response.body).response.agencyId).toBe(`${date.getTime()}-${mockedEvent.body.ownerId}`);
    });
  });

  describe('Error: Bad request', () => {
    it('Should return status 400 if ownerId is not provided', async () => {
      const event = { ...mockedEvent, body: { ...mockedEvent.body, ownerId: null } };
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.missingInfo.message);
    });

    it('Should return status 400 if action is not provided', async () => {
      const event = { ...mockedEvent, body: { ...mockedEvent.body, action: undefined } };
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.missingInfo.message);
    });

    it('Should return status 400 if action is not recognized', async () => {
      const event = { ...mockedEvent, body: { ...mockedEvent.body, action: 'WHATEVER' } };
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.unrecognizedAction.message);
    });
  });

  describe('Error: Server error', () => {
    const errorLog = console.error;

    beforeEach(() => {
      console.error = vi.fn();
    });

    afterEach(() => {
      console.error = errorLog;
    });

    it('Should return status 500 if creation fails', async () => {
      mockDB('agencies-test-table', true);
      const response = await handler(mockedEvent, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.error);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.errorFromDynamo.message);
      expect(console.error).toHaveBeenCalledTimes(2);
    });

    it('Should return status 500 if something wrong goes in dynamo process', async () => {
      mockDB('agencies-prod-table'); // Mocking a different table to mock a put in a non existance table
      const response = await handler(mockedEvent, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.error);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.errorFromDynamo.message);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error on dynamo DB');
    });
  });
});
