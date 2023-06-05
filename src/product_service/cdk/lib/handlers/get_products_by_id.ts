import { buildResponse, AppResponse } from '../../../../utils/utils';
import { Product } from '../models/product';
import { mockProducts } from '../mocks/products';

interface LambdaEventDetail {
    queryStringParameters?: Record<string, string>;
    pathParameters: Record<string, string>;
}

interface Error404Response {
    error: {
        detail: string;
    };
}

export async function handler(event: LambdaEventDetail): Promise<AppResponse> {
    const { productId } = event.pathParameters;
    const product = mockProducts.find((item) => item.id === productId);
    let response = buildResponse<Error404Response>(404, {
        error: {
            detail: 'Product not found',
        },
    });
    if (product) {
        response = buildResponse<Product>(200, product);
    }
    return response;
}
