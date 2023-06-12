import { handler as getProductsById } from '../src/product_service/cdk/lib/handlers/get_products_by_id_dynamo';
import { mockProducts } from '../src/product_service/cdk/lib/mocks/products';

test('Product detail route should return Product object', async () => {
    const product = mockProducts[0];
    const response = await getProductsById({
        pathParameters: { productId: product.id },
    });
    const data = JSON.parse(response.body);
    expect(data).toMatchObject(product);
    expect(response.statusCode).toEqual(200);
});

test('Product detail route should error 404 if Product with given "id" doesn\'t exist', async () => {
    const response = await getProductsById({
        pathParameters: { productId: 'fake' },
    });
    expect(response.statusCode).toEqual(404);
});
