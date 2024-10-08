import { APIGatewayEvent, Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import {
  StatusCodes,
  ApiResponse,
  getEnv,
  Stage,
  MaxfriseErrorCodes,
} from "../../common";
import {
  PROPERTY_STATUS,
  InitLeaseRequest,
  LandLord,
  Tenant,
  Responsebody,
} from "./types";
import { getJobDates } from "./util/getJobDates";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler: Handler<
  APIGatewayEvent,
  ApiResponse<InitLeaseRequest>
> = async (event) => {
  if (!event.body)
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, {
      message: MaxfriseErrorCodes.missingInfo.message,
    });
  const body = JSON.parse(event.body) as InitLeaseRequest;
  const environment = getEnv(event.requestContext.stage);
  const housesTableName = environment === Stage.PROD ? "houses-prod" : "houses";
  const paymentJobsTableName =
    environment === Stage.PROD ? "paymentJobs-prod" : "paymentJobs";
  let isUserOwner = false;
  let houseAvailable = false;
  let jobsCreated;

  try {
    const result = await validateHouse(
      body.user,
      body.houseid,
      housesTableName,
    );
    isUserOwner = result.isUserOwner;
    houseAvailable = result.houseAvailable;
  } catch (error) {
    console.error(error);
    return new ApiResponse<Responsebody>(
      MaxfriseErrorCodes.errorFromDynamo.code,
      { message: MaxfriseErrorCodes.errorFromDynamo.message },
    );
  }

  if (!isUserOwner) {
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, {
      message: "The user is not the owner of the house",
    });
  }

  if (!houseAvailable) {
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, {
      message: "The house is not avaible to be leased",
    });
  }

  try {
    jobsCreated = await createJobs(
      body.startDate,
      body.term,
      body.houseid,
      body.rentAmount,
      body.landlords,
      body.tenants,
      paymentJobsTableName,
    );
  } catch (error) {
    console.error(error);
    return new ApiResponse<Responsebody>(
      MaxfriseErrorCodes.errorFromDynamo.code,
      { message: MaxfriseErrorCodes.errorFromDynamo.message },
    );
  }

  try {
    await updateHouseStatus(body.user, body.houseid, housesTableName);
  } catch (error) {
    console.error(error);
    return new ApiResponse<Responsebody>(
      MaxfriseErrorCodes.errorFromDynamo.code,
      { message: MaxfriseErrorCodes.errorFromDynamo.message },
    );
  }

  return new ApiResponse<Responsebody>(StatusCodes.ok, {
    message: "Lease initialized",
    isUserOwner,
    houseAvailable,
    jobsCreated: jobsCreated.length,
  });
};

async function validateHouse(user: string, houseid: string, tableName: string) {
  let itemsFound = 0;
  let houseAvailable = true;
  /**
   * This checks if the uses is the actual owner of the house
   * In the future the user should be retreived interanlly based on the authentication token
   */
  const params = {
    TableName: tableName,
    KeyConditionExpression: "#PK = :pk AND #SK = :sk",
    ExpressionAttributeNames: {
      "#PK": "landlord",
      "#SK": "houseId",
    },
    ExpressionAttributeValues: {
      ":pk": `email#${user}`,
      ":sk": `house#${houseid}`,
    },
  };

  try {
    const command = new QueryCommand(params);
    const data = await ddb.send(command);
    houseAvailable = data?.Items?.[0].leaseStatus === PROPERTY_STATUS.AVAILABLE;
    itemsFound = data?.Items?.length || 0;
  } catch (error) {
    throw new Error((error as Error).message);
  }

  return Promise.resolve({
    isUserOwner: itemsFound >= 1,
    houseAvailable,
  });
}

async function createJobs(
  startDate: string,
  term: string,
  houseid: string,
  rentAmount: string,
  landlords: LandLord[],
  tenants: Tenant[],
  tableName: string,
) {
  return Promise.all(
    getJobDates(startDate, term).map(async (jobDate) => {
      const input = {
        Item: {
          pk: `p#${jobDate}`,
          st: `${houseid}|${jobDate}|${uuidv4()}`,
          details: [{ amount: rentAmount }],
          houseid: {
            S: houseid,
          },
          landlords: landlords,
          tenants: tenants,
          status: "NOT_DUE",
        },
        TableName: tableName,
      };
      try {
        const command = new PutCommand(input);
        return await ddb.send(command);
      } catch (error) {
        throw new Error((error as Error).message);
      }
    }),
  );
}

async function updateHouseStatus(
  user: string,
  houseid: string,
  tableName: string,
) {
  const input = {
    TableName: tableName,
    Key: {
      landlord: `email#${user}`,
      houseId: `house#${houseid}`,
    },
    UpdateExpression: "SET leaseStatus = :newValue",
    ExpressionAttributeValues: {
      ":newValue": PROPERTY_STATUS.LEASED,
    },
  };
  try {
    const command = new UpdateCommand(input);
    return await ddb.send(command);
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
