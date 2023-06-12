import {
  APIGatewayEvent,
  APIGatewayProxyEventPathParameters,
} from 'aws-lambda';
import { ProductWithStock } from '../models/product_with_stock';

export interface LambdaEventDetail extends APIGatewayEvent {
  pathParameters: APIGatewayProxyEventPathParameters & { productId: string };
}

export interface CreateProductRequest {
  data: { type: string; attributes: CreateProductRequestAttributes };
}

export interface CreateProductRequestAttributes
  extends Pick<ProductWithStock, 'title' | 'description'> {
  count: string;
  price: string;
}

export interface CreateProductResponse {
  data: ProductWithStock;
}
