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

import { ProductItemDynamoDb } from '../models/product_item_dynamodb';
import { ProductWithStock } from '../models/product_with_stock';
import { BadRequestError } from '../models/errors';
import { StockItemDynamoDb } from '../models/stock_item_dynamodb';

interface CreateProductRequestAttributes
  extends Pick<ProductWithStock, 'title' | 'description'> {
  count: string;
  price: string;
}

interface CreateProductRequest {
  data: { type: string; attributes: CreateProductRequestAttributes };
}

interface CreateProductResponse {
  data: ProductWithStock;
}

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

function validateCreateProductRequestBody({
  bodyObject,
}: {
  bodyObject: CreateProductRequest;
}): void {
  if (!('data' in bodyObject) || !('attributes' in bodyObject.data)) {
    throw new BadRequestError(400, 'Wrong body format');
  }
  const attributes = bodyObject.data.attributes;
  for (const property of ['price', 'title', 'description', 'count']) {
    if (!(property in attributes)) {
      throw new BadRequestError(400, `Request must have "${property}" value`);
    }
  }
  const priceNumber = Number(attributes.price);
  const countNumber = Number(attributes.count);

  if (Number.isNaN(priceNumber) || Number.isNaN(countNumber)) {
    throw new BadRequestError(400, 'Wrong parameter types');
  }
  if (priceNumber <= 0) {
    throw new BadRequestError(400, '"price" must a positive number');
  }
  if (countNumber <= 0) {
    throw new BadRequestError(400, '"count" must a non-negative number');
  }
  const MAX_DESCRIPTION_LENGTH = 1024;
  const MAX_TITLE_LENGTH = 128;
  const stringProps: { name: 'title' | 'description'; maxLength: number }[] = [
    { name: 'description', maxLength: MAX_DESCRIPTION_LENGTH },
    { name: 'title', maxLength: MAX_TITLE_LENGTH },
  ];
  for (const { name, maxLength } of stringProps) {
    if (!attributes[name] || attributes[name].length > maxLength) {
      throw new BadRequestError(
        400,
        `"${name}" must not be empty or longer than ${maxLength} symbol(s)`
      );
    }
  }
}

function parseCreateProductRequestBody({
  body,
}: {
  body: string | null;
}): CreateProductRequest {
  if (body === null) {
    throw new BadRequestError(400, 'Empty body');
  }
  const bodyObject: CreateProductRequest = JSON.parse(body);
  validateCreateProductRequestBody({ bodyObject });
  return bodyObject;
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

    const [productId, transactionOutput] = await createProduct({
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
      return buildResponse(err.statusCode, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
