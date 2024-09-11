import { Context } from "aws-lambda";

export const mockedContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "mocked",
  functionVersion: "mocked",
  invokedFunctionArn: "mocked",
  memoryLimitInMB: "mocked",
  awsRequestId: "mocked",
  logGroupName: "mocked",
  logStreamName: "mocked",
  getRemainingTimeInMillis(): number {
    return 999;
  },
  done(): void {
    return;
  },
  fail(): void {
    return;
  },
  succeed(): void {
    return;
  },
};
