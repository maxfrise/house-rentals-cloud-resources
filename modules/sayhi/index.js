/**
 * TODOS:
 * Create zip
 * Upload zip
 * Add layer
 * Connect to layer
 * Add TS support
 */
module.exports.handler = async (event) => {
    console.log('Event: ', event);
    let responseMessage = 'Hello, World!';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: responseMessage,
      }),
    }
  }