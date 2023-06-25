import { mockClient } from 'aws-sdk-client-mock';
import { S3RequestPresigner as mockS3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { HttpRequest, RequestPresigningArguments } from '@aws-sdk/types';
import * as mockUtilFormatUrl from '@aws-sdk/util-format-url';

import { S3 } from '@aws-sdk/client-s3';

const s3Mock = mockClient(S3);

import { handler as importProductsFile } from '../src/cdk/lib/handlers/import_products_file';

describe('importProductsFile handler tests', () => {
  beforeAll(() => {
    jest
      .spyOn(mockS3RequestPresigner.prototype, 'presign')
      .mockImplementation(
        (request: HttpRequest, args?: RequestPresigningArguments) => {
          return Promise.resolve({} as HttpRequest);
        }
      );
    jest.spyOn(mockUtilFormatUrl, 'formatUrl');
  });

  beforeEach(() => {
    s3Mock.reset();
  });

  test('Should return error 400 if query parameter `name` is not provided', async () => {
    const event = {} as any;
    const result = await importProductsFile(event);
    expect(result).toHaveProperty('statusCode', 400);
  });

  test('Should call SDK S3 functions and return URL if query parameter `name` is provided', async () => {
    const event = {
      queryStringParameters: {
        name: 'fileName',
      },
    } as any;
    const result = await importProductsFile(event);
    expect(result).toHaveProperty('statusCode', 200);
    expect(mockUtilFormatUrl.formatUrl).toBeCalledTimes(1);
    expect(JSON.parse(result.body)).toHaveProperty('url');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
