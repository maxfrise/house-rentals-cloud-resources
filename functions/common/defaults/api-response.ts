import { Response, StatusCodes } from "../types";
import { defaultResponse } from "./default-response";

export class ApiResponse<T> implements Response {
  statusCode: StatusCodes;
  body: string;
  headers = defaultResponse.headers;
  isBase64Encoded = defaultResponse.isBase64Encoded;

  constructor(statusCode: StatusCodes = 200, body: T = {} as T, headers = {}) {
    this.statusCode = statusCode;
    this.body = JSON.stringify(body);
    this.headers = {
      ...this.headers,
      ...headers,
    };
  }
}
