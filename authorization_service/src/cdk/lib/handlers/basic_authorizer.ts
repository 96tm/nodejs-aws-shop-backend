import { APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';

interface SimpleResponse {
  isAuthorized: boolean;
}

function generateSimpleResponse(isAuthorized: boolean): SimpleResponse {
  return {
    isAuthorized,
  };
}

export async function handler(
  event: APIGatewayRequestAuthorizerEventV2
): Promise<SimpleResponse> {
  console.log(event);
  try {
    const cred = event.identitySource[0].split(' ')[1];
    const [userName, password] = Buffer.from(cred, 'base64')
      .toString()
      .split(':');
    const areCredentialsCorrect =
      userName === process.env.AUTH_USER &&
      password === process.env.AUTH_PASSWORD;
    return generateSimpleResponse(areCredentialsCorrect);
  } catch (err) {
    console.error(err);
    return generateSimpleResponse(false);
  }
}
