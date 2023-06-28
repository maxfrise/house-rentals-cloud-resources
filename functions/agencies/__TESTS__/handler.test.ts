import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { vi } from 'vitest';

import { handler } from '../src';
import { mockedContext } from '../../common/mocks';
import { Event, Response, StatusCodes, StageEnvironment } from '../../common';
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

const mockDB = (tableName: string, statusCode = 200) => {
  if (statusCode === 200) {
    return ddbMock.on(PutCommand, { TableName: tableName }).resolves({
      $metadata: {
        httpStatusCode: statusCode
      }
    });
  }

  ddbMock.on(PutCommand, { TableName: tableName }).rejects();
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

      const response = await handler(mockedEvent, mockedContext, () => undefined) as Response<AgenciesResponse>;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(response.body.agencyId).toBe(`${date.getTime()}-${mockedEvent.body.ownerId}`);
    });

    it('Should execute creation correctly when is prod', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date);

      // This should break given that I only mocked the test table not the prod table right?
      mockDB('agencies-test-table');

      const response = await handler({ ...mockedEvent, environment: 'prod' }, mockedContext, () => undefined) as Response<AgenciesResponse>;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(response.body.agencyId).toBe(`${date.getTime()}-${mockedEvent.body.ownerId}`);
    });
  });

  describe('Error: Bad request', () => {
    it('Should return status 400 if ownerId is not provided', async () => {
      const event = { ...mockedEvent, body: { ...mockedEvent.body, ownerId: null } };
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response<AgenciesResponse>;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
    });

    it('Should return status 400 if action is not provided', async () => {
      const event = { ...mockedEvent, body: { ...mockedEvent.body, action: undefined } };
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response<AgenciesResponse>;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
    });

    it('Should return status 400 if action is not recognized', async () => {
      const event = { ...mockedEvent, body: { ...mockedEvent.body, action: 'WHATEVER' } };
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response<AgenciesResponse>;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
    });
  });

  describe('Error: Server error', () => {
    const errorLog = console.error;
    const log = console.log;

    beforeEach(() => {
      console.error = vi.fn();
      console.log = vi.fn();
    });

    afterEach(() => {
      console.error = errorLog;
      console.log = log;
    });

    it('Should return status 500 if creation fails', async () => {
      mockDB('agencies-test-table', 500);
      const response = await handler(mockedEvent, mockedContext, () => undefined) as Response<AgenciesResponse>;

      expect(response.statusCode).toBe(StatusCodes.error);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error on put command execution');
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });
});