import { Handler, APIGatewayEvent } from 'aws-lambda';

import { AgenciesRequest, AgenciesResponse } from './types';
import { ApiResponse, parseStageVariables, MaxfriseErrorCodes } from '../../common';
import { addAgency } from './actions';

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
  const environment = parseStageVariables(event.stageVariables?.environment);
  const request = JSON.parse(event.body) as AgenciesRequest;

  if (!request.action || !request.ownerId) {
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