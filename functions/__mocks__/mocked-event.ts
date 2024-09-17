import { APIGatewayEvent } from "aws-lambda";
import { Stage } from "../common";

export const getMockedEvent = (
  body: string | null = null,
  stage = Stage.TEST,
  queryStringParameters = {},
): APIGatewayEvent => {
  return {
    resource: "/",
    path: "/",
    httpMethod: "POST",
    headers: {},
    multiValueHeaders: {},
    queryStringParameters,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: {},
    requestContext: {
      authorizer: null,
      resourceId: "2gxmpl",
      resourcePath: "/",
      httpMethod: "GET",
      extendedRequestId: "JJbxmplHYosFVYQ=",
      requestTime: "10/Mar/2020:00:03:59 +0000",
      path: "/Prod/",
      accountId: "123456789012",
      protocol: "HTTP/1.1",
      stage: stage,
      domainPrefix: "70ixmpl4fl",
      requestTimeEpoch: 1583798639428,
      requestId: "77375676-xmpl-4b79-853a-f982474efe18",
      identity: {
        apiKey: "",
        apiKeyId: "",
        clientCert: null,
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        sourceIp: "52.255.255.12",
        principalOrgId: null,
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
        user: null,
      },
      domainName: "70ixmpl4fl.execute-api.us-east-2.amazonaws.com",
      apiId: "70ixmpl4fl",
    },
    body,
    isBase64Encoded: false,
  };
};
