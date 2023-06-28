import { Handler, } from 'aws-lambda';

import { AgenciesRequest, AgenciesResponse } from './types';
import { Event, Response, StatusCodes, defaultResponse } from '../../common';
import { addAgency } from './actions';

export const handler: Handler<Event<AgenciesRequest>, Response> = async (event) => {
  if (!event.body.action || !event.body.ownerId) {
    return {
      ...defaultResponse,
      statusCode: StatusCodes.badRequest,
    }
  }

  if (event.body.action === 'CREATE') {
    const agencyId = await addAgency(event);

    if (agencyId) {
      return {
        ...defaultResponse,
        statusCode: StatusCodes.ok,
        body: JSON.stringify({
          agencyId
        })
      }
    }

    return {
      ...defaultResponse,
      statusCode: StatusCodes.error,
    }
  }

  return {
    ...defaultResponse,
    statusCode: StatusCodes.badRequest,
  }
};