import { StatusCodes } from "../types";

export const defaultResponse = {
  isBase64Encoded: false,
  headers: {
    'Content-Type': 'application/json',
  },
  statusCode: StatusCodes.error,
  body: ''
};