import { Handler, APIGatewayEvent } from 'aws-lambda';

import { AgenciesRequest, AgenciesResponse } from './types';
import { ApiResponse, getEnv, MaxfriseErrorCodes } from '../../common';
import { addAgency, updateAgency, updateAgencyStatus } from './actions';

export const handler: Handler<APIGatewayEvent, ApiResponse<AgenciesResponse>> = async (event) => {
  if (!event.body) {
    return new ApiResponse<AgenciesResponse>(
      MaxfriseErrorCodes.missingInfo.code,
      {
        response: {
          errorMessage: MaxfriseErrorCodes.missingInfo.message
        }
      }
    );
  }

  const environment = getEnv(event.requestContext.stage);
  const request = JSON.parse(event.body) as AgenciesRequest;

  if (!request.action || !request.ownerId) { // TODO: Add is signedIn() check
    return new ApiResponse<AgenciesResponse>(
      MaxfriseErrorCodes.missingInfo.code,
      {
        response: {
          errorMessage: MaxfriseErrorCodes.missingInfo.message
        }
      }
    );
  }

  if (request.action === 'CREATE') {
    return await addAgency(request, environment);
  } else if (request.action === 'UPDATE') {
    return await updateAgency(request, environment);
  } else if (request.action === 'STATUS') {
    return await updateAgencyStatus(request, environment);
  }

  return new ApiResponse<AgenciesResponse>(
    MaxfriseErrorCodes.unrecognizedAction.code,
    {
      response: {
        errorMessage: MaxfriseErrorCodes.unrecognizedAction.message
      }
    }
  );
};