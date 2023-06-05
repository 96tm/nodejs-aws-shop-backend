import { buildResponse, AppResponse } from '../../../../utils/utils';
import { Product } from '../models/product';
import { mockProducts } from '../mocks/products';

interface LambdaEvent {
    queryStringParameters?: Record<string, string>;
}

export async function handler(event: LambdaEvent): Promise<AppResponse> {
    const products = mockProducts;
    const response = buildResponse<Product[]>(200, products);
    return response;
}
