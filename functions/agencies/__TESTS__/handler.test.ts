import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { vi } from 'vitest';

import { handler } from '../src';
import { MaxfriseErrorCodes, Response, Stage, StatusCodes } from '../../common';
import { AgenciesRequest } from '../src/types';
import { getMockedEvent, mockedContext } from '../../__mocks__/';

const mockedBodyRequest: AgenciesRequest = {
  action: 'CREATE',
  address: 'Some address',
  name: 'My agency',
  ownerId: 'owner#email',
  phone: '1234567890'
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

  describe('Add - Success', () => {
    it('Should execute creation correctly', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date);

      mockDB('agencies-test-table');

      const event = getMockedEvent(JSON.stringify(mockedBodyRequest));

      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(JSON.parse(response.body).response.agencyId).toBe(`${date.getTime()}-${mockedBodyRequest.ownerId}`);
    });

    it('Should execute update correctly', async () => {
      const request = { ...mockedBodyRequest, action: 'UPDATE', agencyId: 'agencyId' };
      mockDB('agencies-test-table');

      const event = getMockedEvent(JSON.stringify(request));

      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
    });

    it('Should execute creation correctly when optional values are not present', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date);

      const request = { ...mockedBodyRequest, address: undefined, name: null, phone: null };
      const event = getMockedEvent(JSON.stringify(request));

      mockDB('agencies-test-table');

      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(JSON.parse(response.body).response.agencyId).toBe(`${date.getTime()}-${request.ownerId}`);
    });

    it('Should execute creation correctly when is prod', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date);

      mockDB('agencies-prod-table');

      const event = getMockedEvent(JSON.stringify(mockedBodyRequest), Stage.PROD);

      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
      expect(JSON.parse(response.body).response.agencyId).toBe(`${date.getTime()}-${mockedBodyRequest.ownerId}`);
    });
  });

  describe('Error: Bad request', () => {
    it('Should return status 400 if body is empty', async () => {
      const event = getMockedEvent('');
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.missingInfo.message);
    });

    it('Should return status 400 if ownerId is not provided', async () => {
      const bodyRequest = { ...mockedBodyRequest, ownerId: null };
      const event = getMockedEvent(JSON.stringify(bodyRequest));
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.missingInfo.message);
    });

    it('Should return status 400 if action is not provided', async () => {
      const bodyRequest = { ...mockedBodyRequest, action: null };
      const event = getMockedEvent(JSON.stringify(bodyRequest));
      //@ts-ignore
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.missingInfo.message);
    });

    it('Should return status 400 if action is not recognized', async () => {
      const bodyRequest = { ...mockedBodyRequest, action: 'WHATEVER' };
      const event = getMockedEvent(JSON.stringify(bodyRequest));
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

      const event = getMockedEvent(JSON.stringify(mockedBodyRequest));

      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.error);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.errorFromDynamo.message);
      expect(console.error).toHaveBeenCalledTimes(2);
    });

    it('Should return status 500 if something wrong goes in dynamo process', async () => {
      mockDB('agencies-prod-table'); // Mocking a different table to mock a put in a non existance table

      const event = getMockedEvent(JSON.stringify(mockedBodyRequest));
      const response = await handler(event, mockedContext, () => undefined) as Response;

      expect(response.statusCode).toBe(StatusCodes.error);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.errorFromDynamo.message);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error on dynamo DB');
    });
  });
});
