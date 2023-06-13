import { Handler } from 'aws-lambda';
import { Event } from './event';

export const handler: Handler = async (event: Event) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    console.log('new log added')
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: { house: event.houseid, tenant: event.tenanantName },
        }),
    };
};
