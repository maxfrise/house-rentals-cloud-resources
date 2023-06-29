import { Handler, } from 'aws-lambda';

import { AgenciesRequest, AgenciesResponse } from './types';
import { ApiResponse, Event, MaxfriseErrorCodes } from '../../common';
import { addAgency } from './actions';

export const handler: Handler<Event<AgenciesRequest>, ApiResponse<AgenciesResponse>> = async (event) => {
  if (!event.body.action || !event.body.ownerId) {
    return new ApiResponse<AgenciesResponse>(
      MaxfriseErrorCodes.missingInfo.code,
      {
        response: {
          errorMessage: MaxfriseErrorCodes.missingInfo.message
        }
      }
    );
  }

  if (event.body.action === 'CREATE') {
    return await addAgency(event);
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