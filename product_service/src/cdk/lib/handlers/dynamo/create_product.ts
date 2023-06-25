import { randomUUID } from 'crypto';
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayEvent } from 'aws-lambda';

import {
  buildResponse,
  AppResponse,
  buildServerErrorResponse,
} from '../../../../utils/utils';

import { ProductItemDynamoDb } from '../../models/product_item_dynamodb';
import { ProductWithStock } from '../../models/product_with_stock';
import { BadRequestError } from '../../models/errors';
import { StockItemDynamoDb } from '../../models/stock_item_dynamodb';
import { CreateProductRequest, CreateProductResponse } from '../types';
import { parseCreateProductRequestBody } from '../validation';

async function createProduct({
  documentClient,
  productData,
}: {
  documentClient: DynamoDBDocumentClient;
  productData: CreateProductRequest;
}): Promise<[string, TransactWriteCommandOutput]> {
  const tableNameProducts = process.env.APP_PRODUCTS_TABLE_NAME as string;
  const tableNameStocks = process.env.APP_STOCKS_TABLE_NAME as string;

  const productId = randomUUID();
  const productAttributes = productData.data.attributes;
  const productItem: ProductItemDynamoDb = {
    id: { S: productId },
    price: { N: productAttributes.price.toString() },
    title: { S: productAttributes.title },
    description: { S: productAttributes.description },
  };
  const stockItem: StockItemDynamoDb = {
    product_id: { S: productId },
    count: { N: productAttributes.count.toString() },
  };
  const commandOutput = await documentClient.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: tableNameProducts,
            Item: productItem,
          },
        },
        {
          Put: {
            TableName: tableNameStocks,
            Item: stockItem,
          },
        },
      ],
    })
  );
  return [productId, commandOutput as TransactWriteCommandOutput];
}

export async function handler(event: APIGatewayEvent): Promise<AppResponse> {
  console.log(event);
  try {
    const body = parseCreateProductRequestBody({ body: event.body });
    const {
      data: {
        attributes: { count, price, title, description },
      },
    } = body;
    const client = new DynamoDBClient({});
    const dynamo = DynamoDBDocumentClient.from(client);

    const [productId, _] = await createProduct({
      documentClient: dynamo,
      productData: body,
    });

    const productWithStock: ProductWithStock = {
      id: productId,
      price: Number(price),
      title: title,
      description: description,
      count: Number(count),
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
