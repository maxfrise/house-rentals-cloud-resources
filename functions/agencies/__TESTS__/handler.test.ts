import { Context } from 'aws-lambda';
import { handler } from '../src';

const mockedContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'mocked',
  functionVersion: 'mocked',
  invokedFunctionArn: 'mocked',
  memoryLimitInMB: 'mocked',
  awsRequestId: 'mocked',
  logGroupName: 'mocked',
  logStreamName: 'mocked',
  getRemainingTimeInMillis(): number {
    return 999;
  },
  done(error?: Error, result?: any): void {
    return;
  },
  fail(error: Error | string): void {
    return;
  },
  succeed(messageOrObject: any): void {
    return;
  }
};

describe('agencies handler', () => {
  it('Should execute correctly', async () => {
    const response = await handler({}, mockedContext, () => undefined);
    expect(response).toStrictEqual({
      "body": "{\"message\":\"Agencies function\"}",
      "statusCode": 200,
    });
  });
});