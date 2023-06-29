import { SQSEvent } from 'aws-lambda';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import {
  buildResponse,
  AppResponse,
  buildServerErrorResponse,
} from '../../../../utils/utils';
import { createProduct } from './utils';
import { CreateProductRequest, CreateProductRequestAttributes } from '../types';
import { validateCreateProductRequestBody } from '../validation';
import { CatalogBatchProcessItemResult } from './types';
import { BadRequestError } from '../../models/errors';

const snsClient = new SNSClient({});

export async function handler(event: SQSEvent): Promise<AppResponse> {
  try {
    console.log(event);
    const recordItems = event.Records.map((item) => item.body);
    const results: CatalogBatchProcessItemResult[] = [];
    for (const recordItem of recordItems) {
      const parsedItem: CreateProductRequestAttributes = JSON.parse(recordItem);
      const bodyObject: CreateProductRequest = {
        data: { type: 'create', attributes: parsedItem },
      };
      validateCreateProductRequestBody({ bodyObject });
      const productId = await createProduct({ productData: bodyObject });
      const result: CatalogBatchProcessItemResult = {
        id: productId,
        ...parsedItem,
      };
      results.push(result);
      await snsClient.send(
        new PublishCommand({
          Subject: 'New product(s) added',
          Message: JSON.stringify(result),
          TopicArn: process.env.CREATE_PRODUCTS_TOPIC_ARN,
          MessageAttributes: {
            count: {
              DataType: 'Number',
              StringValue: parsedItem.count,
            },
          },
        })
      );
    }

    return buildResponse<CatalogBatchProcessItemResult[]>(201, results);
  } catch (err) {
    console.error(err);
    if (err instanceof BadRequestError) {
      return buildResponse(400, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
