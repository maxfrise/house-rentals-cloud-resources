import { Handler } from 'aws-lambda';

import { AgenciesRequest, AgenciesResponse } from './types';
import { Event, Response, StatusCodes } from '../../common';
import { addAgency } from './actions';

export const handler: Handler<Event<AgenciesRequest>, Response<AgenciesResponse>> = async (event) => {
  let agencyId = '';

  if (!event.body.action || !event.body.ownerId) {
    return {
      statusCode: StatusCodes.badRequest,
      body: {
        agencyId: null
      }
    }
  }

  if (event.body.action === 'CREATE') {
    agencyId = await addAgency(event);

    return {
      statusCode: StatusCodes.ok,
      body: {
        agencyId
      }
    }
  }

  return {
    statusCode: StatusCodes.badRequest,
    body: {
      agencyId: null
    }
  }
};