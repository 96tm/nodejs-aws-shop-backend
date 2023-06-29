import { APIGatewayEvent } from 'aws-lambda';

import {
  buildResponse,
  AppResponse,
  buildServerErrorResponse,
} from '../../../../utils/utils';

import { ProductWithStock } from '../../models/product_with_stock';
import { BadRequestError } from '../../models/errors';
import { CreateProductResponse } from '../types';
import { parseCreateProductRequestBody } from '../validation';
import { createProduct } from './utils';

export async function handler(event: APIGatewayEvent): Promise<AppResponse> {
  console.log(event);
  try {
    const body = parseCreateProductRequestBody({ body: event.body });
    const {
      data: {
        attributes: { count, price, title, description },
      },
    } = body;

    const productId = await createProduct({
      productData: body,
    });

    const productWithStock: ProductWithStock = {
      id: productId,
      price: Number(price),
      title: title,
      description: description,
      count: parseInt(count),
    };
    const response: CreateProductResponse = {
      data: productWithStock,
    };
    return buildResponse<CreateProductResponse>(201, response);
  } catch (err) {
    console.error(err);
    if (err instanceof BadRequestError) {
      return buildResponse(400, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
