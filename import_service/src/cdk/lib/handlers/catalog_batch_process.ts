import { APIGatewayEvent } from 'aws-lambda';

import {
  AppResponse,
  buildResponse,
  buildServerErrorResponse,
} from '../../../utils/utils';
import { BadRequestError } from '../models/errors';

export async function handler(event: APIGatewayEvent): Promise<AppResponse> {
  try {
    console.log(event);

    return buildResponse<{}>(200, {});
  } catch (err) {
    console.error(err);
    if (err instanceof BadRequestError) {
      return buildResponse(400, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
