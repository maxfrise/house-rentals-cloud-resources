import { DynamoDBClient, QueryCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import type { Event, LandLord, Tenant } from './event'

const client = new DynamoDBClient({ region: "us-west-2" });

export const handler = async (event: Event) => {
  const housesTableName = event.environment === "prod" ? 'houses-prod' : 'houses'
  const paymentJobsTableName = event.environment === "prod" ? 'paymentJobs-prod' : 'paymentJobs'
  const body = event.body
  const { isUserOwner, houseAvailable } = await validateHouse(body.user, body.houseid, housesTableName)

  if (!isUserOwner) {
    throw new Error("The user is not the owner of the house")
  }

  if (!houseAvailable) {
    throw new Error("The house is not avaible to be leased")
  }

  const jobsCreated = await createJobs(
    body.startDate,
    body.term,
    body.houseid,
    body.rentAmount,
    body.landlords,
    body.tenants,
    paymentJobsTableName
  )

  await updateHouseStatus(body.user, body.houseid, housesTableName)

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      isUserOwner,
      houseAvailable,
      jobsCreated: jobsCreated.length
    }),
  };
  return response;
};

async function validateHouse(user: string, houseid: string, tableName: string) {
  // TODO: validate that the house is not leased
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
    ExpressionAttributeValues: marshall({
      ":pk": `email#${user}`,
      ":sk": `house#${houseid}`
    }),
  };

  try {
    const command = new QueryCommand(params);
    const data = await client.send(command);
    houseAvailable = data.Items.map((item) => unmarshall(item))[0]?.leaseStatus === "AVAILABLE"
    itemsFound = data.Count
  } catch (error) {
    console.log(error);
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
        "pk": {
          "S": `p#${jobDate}`
        },
        "st": {
          "S": `${houseid}|${jobDate}|${uuidv4()}`
        },
        "details": {
          "L": marshall([{ amount: rentAmount }])
        },
        "houseid": {
          "S": houseid
        },
        "landlords": {
          "L": marshall(landlords)
        },
        "tenants": {
          "L": marshall(tenants)
        },
        "status": {
          "S": "NOT_DUE"
        }
      },
      "TableName": tableName
    };
    const command = new PutItemCommand(input)
    try {
      return await client.send(command);
    } catch (e) {
      console.log("Error updating the items")
      return Promise.reject(e)
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
      "landlord": { S: `email#${user}` },
      "houseId": { S: `house#${houseid}` }
    },
    UpdateExpression: "SET leaseStatus = :newValue",
    ExpressionAttributeValues: {
      ":newValue": { S: "LEASED" }
    }
  };
  const command = new UpdateItemCommand(input)
  try {
    return await client.send(command);
  } catch (e) {
    console.log("Error updating the items")
    return Promise.reject(e)
  }
}
