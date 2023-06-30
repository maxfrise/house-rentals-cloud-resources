import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { vi } from 'vitest';

import { updateAgency } from '../../src/actions'
import { MaxfriseErrorCodes, Response, Stage, StatusCodes } from '../../../common';
import { AgenciesRequest } from '../../src/types';
import { getMockedEvent, mockedContext } from '../../../__mocks__/';

const mockedBodyRequest: AgenciesRequest = {
  action: 'UPDATE',
  agencyId: 'agencyId',
  address: 'Some address',
  name: 'My agency',
  ownerId: 'owner#email',
  phone: '1234567890'
};

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockDB = (tableName: string, rejects = false, item = null) => {
  if (rejects) {
    return ddbMock.on(UpdateCommand, { TableName: tableName }).rejects('Some dynamo error');
  }

  return ddbMock.on(UpdateCommand, item || { TableName: tableName }).resolves({
    $metadata: {
      httpStatusCode: 200
    }
  });
}

describe('updateAgencies()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    ddbMock.reset();
  });

  describe('Update - Success', () => {
    it('Should execute update correctly', async () => {
      mockDB('agencies-test-table');

      const response = await updateAgency(mockedBodyRequest, Stage.TEST) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
    });

    it('Should execute update correctly when optional values are not present', async () => {
      const request = { ...mockedBodyRequest, address: undefined, name: undefined, phone: undefined };

      mockDB('agencies-test-table');

      const response = await updateAgency(request, Stage.TEST) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
    });

    it('Should execute update correctly when is prod', async () => {
      mockDB('agencies-prod-table');

      const response = await updateAgency(mockedBodyRequest, Stage.PROD) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
    });
  });

  describe('Error: Bad request', () => {
    it('Should return status 400 if agencyId is not provided', async () => {
      const bodyRequest = { ...mockedBodyRequest, agencyId: undefined };

      const response = await updateAgency(bodyRequest, Stage.PROD) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.missingInfo.message);
    });

    it('Should return status 400 if ownerId is not provided', async () => {
      const bodyRequest = { ...mockedBodyRequest, ownerId: undefined };

      //@ts-ignore
      const response = await updateAgency(bodyRequest, Stage.TEST) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.missingInfo.message);
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

    it('Should return status 500 if update fails', async () => {
      mockDB('agencies-test-table', true);

      const response = await updateAgency(mockedBodyRequest, Stage.TEST) as Response;

      expect(response.statusCode).toBe(StatusCodes.error);
      expect(JSON.parse(response.body).response.errorMessage).toBe(MaxfriseErrorCodes.errorFromDynamo.message);
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });
});
