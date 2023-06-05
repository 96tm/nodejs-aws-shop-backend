import { handler as getProductsList } from '../src/product_service/cdk/lib/handlers/get_products_list';

test('List route should return array', async () => {
    const response = await getProductsList({});
    const data = JSON.parse(response.body);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(data)).toBe(true);
});
