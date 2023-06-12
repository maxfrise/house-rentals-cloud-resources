import { handler } from "../index"
import { Context } from "aws-lambda";
import event from "../event.json";

describe("Hanlder", () => {

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

    test("echo the event", async () => {
        const result = await handler(event, mockedContext, () => undefined)
        expect(result).toStrictEqual({
            body: '{"message":{"house":1234,"tenant":"sergio"}}',
            statusCode: 200
        });
    });
});
