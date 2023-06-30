import { APIGatewayEvent, Handler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import type { InitLeaseRequest, LandLord, Tenant, Responsebody } from './event'
import { StatusCodes, ApiResponse, getEnv, Stage, MaxfriseErrorCodes } from '../../common';

const client = new DynamoDBClient({ region: "us-west-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler: Handler<APIGatewayEvent, ApiResponse<InitLeaseRequest>> = async (event) => {
  if (!event.body) return new ApiResponse<Responsebody>(StatusCodes.badRequest, { message: MaxfriseErrorCodes.missingInfo.message })
  const body = JSON.parse(event.body) as InitLeaseRequest
  const environment = getEnv(event.requestContext.stage)
  const housesTableName = environment === Stage.PROD ? 'houses-prod' : 'houses'
  const paymentJobsTableName = environment === Stage.PROD ? 'paymentJobs-prod' : 'paymentJobs'
  let isUserOwner = false
  let houseAvailable = false
  let jobsCreated

  try {
    const result = await validateHouse(body.user, body.houseid, housesTableName)
    isUserOwner = result.isUserOwner
    houseAvailable = result.houseAvailable
  } catch (error) {
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, { message: (error as Error).message })
  }

  if (!isUserOwner) {
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, { message: 'The user is not the owner of the house' })
  }

  if (!houseAvailable) {
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, { message: 'The house is not avaible to be leased' })
  }

  try {
    jobsCreated = await createJobs(
      body.startDate,
      body.term,
      body.houseid,
      body.rentAmount,
      body.landlords,
      body.tenants,
      paymentJobsTableName
    )
  } catch (error) {
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, { message: (error as Error).message })
  }

  try {
    await updateHouseStatus(body.user, body.houseid, housesTableName)
  } catch (error) {
    return new ApiResponse<Responsebody>(StatusCodes.badRequest, { message: (error as Error).message })
  }

  return new ApiResponse<Responsebody>(StatusCodes.ok,
    {
      message: "Lease initialized",
      isUserOwner,
      houseAvailable,
      jobsCreated: jobsCreated.length
    }
  )
};

async function validateHouse(user: string, houseid: string, tableName: string) {
  let itemsFound = 0
  let houseAvailable = true
  /**
   * This checks if the uses is the actual owner of the house
   * In the future the user should be retreived interanlly based on the authentication token
   */
  const params = {
    TableName: tableName,
    KeyConditionExpression: "#PK = :pk AND #SK = :sk",
    ExpressionAttributeNames: {
      "#PK": "landlord",
      "#SK": "houseId"
    },
    ExpressionAttributeValues: {
      ":pk": `email#${user}`,
      ":sk": `house#${houseid}`
    },
  };

  try {
    const command = new QueryCommand(params);
    const data = await ddb.send(command)
    houseAvailable = data?.Items?.[0].leaseStatus === "AVAILABLE"
    itemsFound = data?.Items?.length || 0
  } catch (error) {
    throw new Error((error as Error).message)
  }

  return Promise.resolve({
    isUserOwner: itemsFound >= 1,
    houseAvailable
  })
}

async function createJobs(
  startDate: string,
  term: string,
  houseid: string,
  rentAmount: string,
  landlords: LandLord[],
  tenants: Tenant[],
  tableName: string
) {
  return Promise.all(getJobDates(startDate, term).map(async (jobDate) => {
    const input = {
      "Item": {
        "pk": `p#${jobDate}`,
        "st": `${houseid}|${jobDate}|${uuidv4()}`,
        "details": [{ amount: rentAmount }],
        "houseid": {
          "S": houseid
        },
        "landlords": landlords,
        "tenants": tenants,
        "status": 'NOT_DUE'
      },
      "TableName": tableName
    };
    try {
      const command = new PutCommand(input)
      return await ddb.send(command);
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }))
}

function getJobDates(startDate: string, term: string) {
  const dates = [new Date(startDate)]; // initialize array with start date
  let currDate = new Date(startDate)
  let count = 1;

  while (count < parseInt(term)) {
    // increment date by 1 month
    currDate.setMonth(currDate.getMonth() + 1);
    let daysAdded = 0

    // adjust date for weekends
    if (currDate.getDay() === 6) { // if it's Saturday
      currDate.setDate(currDate.getDate() + 2); // move to Monday
      daysAdded = 2
    } else if (currDate.getDay() === 0) { // if it's Sunday
      currDate.setDate(currDate.getDate() + 1); // move to Monday
      daysAdded = 1
    }

    dates.push(new Date(currDate));
    // Restore the days once added to the list
    currDate.setDate(currDate.getDate() - daysAdded)
    count++;
  }

  return dates.map((date) => date.toISOString()); // convert dates to ISO strings without time
}

async function updateHouseStatus(user: string, houseid: string, tableName: string) {
  const input = {
    TableName: tableName,
    Key: {
      "landlord": `email#${user}`,
      "houseId": `house#${houseid}`
    },
    UpdateExpression: "SET leaseStatus = :newValue",
    ExpressionAttributeValues: {
      ":newValue": { S: "LEASED" }
    }
  };
  try {
    const command = new UpdateCommand(input)
    return await ddb.send(command);
  } catch (error) {
    throw new Error((error as Error).message)
  }
}
