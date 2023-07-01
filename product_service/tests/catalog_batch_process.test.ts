import { randomUUID } from 'crypto';

import { mockClient } from 'aws-sdk-client-mock';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { createProduct } from '../src/cdk/lib/handlers/rds/utils';
import { handler as catalogBatchProcess } from '../src/cdk/lib/handlers/rds/catalog_batch_process';

jest.mock('../src/cdk/lib/handlers/rds/utils');

import {
  catalogBatchProcessEvent,
  catalogBatchProcessEventWithIncorrectData,
} from './mocks/queue_message_mocks';

const snsClientMock = mockClient(SNSClient);

describe('catalogBatchProcess tests', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    snsClientMock.reset();
  });

  beforeEach(() => {
    snsClientMock.reset();
  });

  test('Should process correct request', async () => {
    (createProduct as jest.Mock).mockReturnValueOnce(randomUUID());
    snsClientMock.on(PublishCommand).resolves({
      MessageId: randomUUID(),
    });

    const result = await catalogBatchProcess(catalogBatchProcessEvent as any);
    expect(result).toHaveProperty('statusCode', 201);
    // one email for each record
    expect(snsClientMock.commandCalls(PublishCommand).length).toEqual(2);
  });

  test('Should return error upon incorrect request', async () => {
    (createProduct as jest.Mock).mockReturnValueOnce(randomUUID());

    const result = await catalogBatchProcess(
      catalogBatchProcessEventWithIncorrectData as any
    );
    expect(result).toHaveProperty('statusCode', 400);
    expect(snsClientMock.commandCalls(PublishCommand).length).toEqual(0);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
