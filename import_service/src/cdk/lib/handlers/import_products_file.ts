import {
  APIGatewayEvent,
  APIGatewayProxyEventQueryStringParameters,
  Context,
} from 'aws-lambda';
import { S3 } from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { HttpRequest } from '@aws-sdk/protocol-http';

import { parseUrl } from '@aws-sdk/url-parser';
import { formatUrl } from '@aws-sdk/util-format-url';

import {
  AppResponse,
  buildResponse,
  buildServerErrorResponse,
} from '../../../utils/utils';
import { BadRequestError } from '../models/errors';

async function createUrl(name: string): Promise<string> {
  const region = process.env.PRODUCT_AWS_REGION;
  const bucketName = process.env.IMPORT_BUCKET_NAME as string;
  const bucketArn = process.env.IMPORT_BUCKET_NAME as string;

  const url = parseUrl(
    `https://${bucketName}.s3.${region}.amazonaws.com/uploaded/${name}`
  );
  const client = new S3({});
  const presigner = new S3RequestPresigner({
    ...client.config,
  });

  const signedUrlObject = await presigner.presign(
    new HttpRequest({ ...url, method: 'PUT' })
  );

  return formatUrl(signedUrlObject);
}

interface ImportProductsFileEvent extends APIGatewayEvent {
  queryStringParameters: APIGatewayProxyEventQueryStringParameters & {
    name: string;
  };
}

export async function handler(
  event: ImportProductsFileEvent,
  context: Context
): Promise<AppResponse> {
  console.log(event);
  try {
    const { name } = event.queryStringParameters || {};
    if (!name) {
      throw new BadRequestError("Parameter 'name' is required");
    }
    const url = await createUrl(name);
    return buildResponse<{ url: string }>(200, { url });
  } catch (err) {
    console.error(err);
    if (err instanceof BadRequestError) {
      return buildResponse(400, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
