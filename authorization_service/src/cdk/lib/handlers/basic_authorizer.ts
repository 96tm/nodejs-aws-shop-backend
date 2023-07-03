import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  Context,
} from 'aws-lambda';

import {
  AppResponse,
  buildResponse,
  buildServerErrorResponse,
} from '../../../utils/utils';
import { BadRequestError } from '../models/errors';

type PolicyEffect = 'Allow' | 'Deny';

function generatePolicy(
  principalId: string,
  resource: string,
  effect: PolicyEffect
): APIGatewayAuthorizerResult {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = now.getUTCDate().toString().padStart(2, '0');
  const version = `${year}-${month}-${day}`;
  const result: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: version,
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  return result;
}

export async function handler(
  event: APIGatewayTokenAuthorizerEvent,
  context: Context
): Promise<AppResponse> {
  console.log(event);
  try {
    const cred = event.authorizationToken.split(' ')[1];
    const [userName, password] = Buffer.from(cred, 'base64').toString().split(':');
    let policyAction: PolicyEffect = 'Deny';
    if (userName === process.env.AUTH_USER && password === process.env.AUTH_PASSWORD) {
      policyAction = 'Allow';
    }
    const policy = generatePolicy(cred, event.methodArn, policyAction);
    return buildResponse<APIGatewayAuthorizerResult>(200, policy);
  } catch (err) {
    console.error(err);
    if (err instanceof BadRequestError) {
      return buildResponse(400, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
