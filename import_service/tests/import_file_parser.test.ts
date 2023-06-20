import fs from 'fs';
import path from 'path';
import { mockClient } from 'aws-sdk-client-mock';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';

import { handler as importFileParser } from '../src/cdk/lib/handlers/import_file_parser';

const s3ClientMock = mockClient(S3Client);

describe('importFileParser handler tests', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    s3ClientMock.reset();
  });

  test('Should `read` uploaded file', async () => {
    s3ClientMock.on(GetObjectCommand).resolves({
      Body: sdkStreamMixin(
        fs.createReadStream(path.join(__dirname, 'mocks', 'products.csv'))
      ),
    });
    const event = {
      Records: [
        {
          s3: {
            object: {
              key: 'uploaded/filename',
            },
            bucket: {
              name: 'mockBucketName',
            },
          },
        },
      ],
    } as any;
    const result = await importFileParser(event);
    expect(result).toHaveProperty('statusCode', 200);
    // logs event and both lines from the mock csv file
    expect(console.log).toBeCalledTimes(3);
    // gets file for parsing, then copies it to `parsed`
    // and deletes from `uploaded`
    expect(s3ClientMock.calls().length).toEqual(3);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
