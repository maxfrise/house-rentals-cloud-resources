import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { vi } from "vitest";

import { updateAgencyStatus } from "../../src/actions";
import {
  MaxfriseErrorCodes,
  Response,
  Stage,
  StatusCodes,
} from "../../../common";
import { AgenciesRequest, AgencyStatus } from "../../src/types";

const mockedBodyRequest: AgenciesRequest = {
  action: "STATUS",
  agencyId: "agencyId",
  ownerId: "owner#email",
  status: AgencyStatus.visible,
};

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockDB = (tableName: string, rejects = false, item = null) => {
  if (rejects) {
    return ddbMock
      .on(UpdateCommand, { TableName: tableName })
      .rejects("Some dynamo error");
  }

  return ddbMock.on(UpdateCommand, item || { TableName: tableName }).resolves({
    $metadata: {
      httpStatusCode: 200,
    },
  });
};

describe("updateAgencyStatus()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    ddbMock.reset();
  });

  describe("Status Update - Success", () => {
    it("Should execute status update correctly", async () => {
      mockDB("agencies-test-table");

      const response = (await updateAgencyStatus(
        mockedBodyRequest,
        Stage.TEST,
      )) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
    });

    it("Should execute status update correctly when optional values are not present", async () => {
      const request = {
        ...mockedBodyRequest,
        address: undefined,
        name: undefined,
        phone: undefined,
      };

      mockDB("agencies-test-table");

      const response = (await updateAgencyStatus(
        request,
        Stage.TEST,
      )) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
    });

    it("Should execute status update correctly when is prod", async () => {
      mockDB("agencies-prod-table");

      const response = (await updateAgencyStatus(
        mockedBodyRequest,
        Stage.PROD,
      )) as Response;

      expect(response.statusCode).toBe(StatusCodes.ok);
    });
  });

  describe("Error: Bad request", () => {
    it("Should return status 400 if agencyId is not provided", async () => {
      const bodyRequest = { ...mockedBodyRequest, agencyId: undefined };

      const response = (await updateAgencyStatus(
        bodyRequest,
        Stage.PROD,
      )) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(
        MaxfriseErrorCodes.missingInfo.message,
      );
    });

    it("Should return status 400 if ownerId is not provided", async () => {
      const bodyRequest = { ...mockedBodyRequest, ownerId: undefined };

      const response = (await updateAgencyStatus(
        // @ts-expect-error idk
        bodyRequest,
        Stage.TEST,
      )) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(
        MaxfriseErrorCodes.missingInfo.message,
      );
    });

    it("Should return status 400 if status is not provided", async () => {
      const bodyRequest = { ...mockedBodyRequest, status: undefined };

      const response = (await updateAgencyStatus(
        bodyRequest,
        Stage.TEST,
      )) as Response;

      expect(response.statusCode).toBe(StatusCodes.badRequest);
      expect(JSON.parse(response.body).response.errorMessage).toBe(
        MaxfriseErrorCodes.missingInfo.message,
      );
    });
  });

  describe("Error: Server error", () => {
    const errorLog = console.error;

    beforeEach(() => {
      console.error = vi.fn();
    });

    afterEach(() => {
      console.error = errorLog;
    });

    it("Should return status 500 if update fails", async () => {
      mockDB("agencies-test-table", true);

      const response = (await updateAgencyStatus(
        mockedBodyRequest,
        Stage.TEST,
      )) as Response;

      expect(response.statusCode).toBe(StatusCodes.error);
      expect(JSON.parse(response.body).response.errorMessage).toBe(
        MaxfriseErrorCodes.errorFromDynamo.message,
      );
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });
});
