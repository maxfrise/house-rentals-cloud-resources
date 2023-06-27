import { handler } from "../index"
import event from "../event.json"
import { Context } from "aws-lambda";

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
            body: "{\"message\":{\"name\":\"Agency A\",\"phone\":\"3121333348\",\"email\":\"myagency@gmail.com\"}}",
            statusCode: 200
        });
    });
});
