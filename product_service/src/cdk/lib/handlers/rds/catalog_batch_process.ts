import { randomUUID } from 'crypto';

import { APIGatewayEvent } from 'aws-lambda';

import {
  buildResponse,
  AppResponse,
  buildServerErrorResponse,
} from '../../../../utils/utils';

export async function handler(event: APIGatewayEvent): Promise<AppResponse> {
  try {
    console.log(event);

    return buildResponse<{}>(201, {});
  } catch (err) {
    console.error(err);
    return buildServerErrorResponse();
  }
}
