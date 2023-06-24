import { Handler } from 'aws-lambda';
import { Event } from './event';

export const handler: Handler = async (event: Event) => {
    console.log('AGENCIES HANDLER: \n' + JSON.stringify(event, null, 2));

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: event,
        }),
    };
};
