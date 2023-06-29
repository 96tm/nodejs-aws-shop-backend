import { S3Event } from 'aws-lambda';

import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import csvParser from 'csv-parser';

import { Transform, pipeline } from 'stream';
import { promisify } from 'util';

import {
  AppResponse,
  buildResponse,
  buildServerErrorResponse,
} from '../../../utils/utils';
import { BadRequestError } from '../models/errors';
import { CreateProductRequestAttributes } from '../models/product';

const client = new S3Client({});
const sqsClient = new SQSClient({});

async function parseFile(bucket: string, key: string): Promise<void> {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  const objectResponse = await client.send(new GetObjectCommand(params));
  const readableStream =
    objectResponse.Body?.transformToWebStream() as unknown as NodeJS.ReadableStream;
  const streamPromise = promisify(pipeline)(
    readableStream,
    new Transform({
      encoding: 'utf-8',
      transform: (data, _, done) => {
        done(null, data);
      },
    }),
    csvParser(),
    new Transform({
      objectMode: true,
      transform: async (data, _, done) => {
        await sendDataToQueue({ data });
        done(null, data);
      },
    })
  );
  await streamPromise;
}

async function sendDataToQueue({
  data,
}: {
  data: CreateProductRequestAttributes;
}) {
  const command = new SendMessageCommand({
    QueueUrl: process.env.IMPORT_SQS_URL,
    MessageBody: JSON.stringify(data),
  });
  return sqsClient.send(command);
}

async function moveToParsed(
  bucket: string,
  uploadedDirectoryKey: string
): Promise<void> {
  try {
    const fileName = uploadedDirectoryKey.replace(/[^/]*\//, '');

    const copyParams = {
      Bucket: bucket,
      CopySource: `${bucket}/${uploadedDirectoryKey}`,
      Key: `${process.env.IMPORT_BUCKET_PARSED_DIR}/${fileName}`,
    };
    await client.send(new CopyObjectCommand(copyParams));
    const deleteParams = {
      Bucket: bucket,
      Key: uploadedDirectoryKey,
    };
    await client.send(new DeleteObjectCommand(deleteParams));
  } catch (err) {
    console.error(err);
  }
}

export async function handler(event: S3Event): Promise<AppResponse> {
  console.log(event);
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, ' ')
    );
    await parseFile(bucket, key);
    await moveToParsed(bucket, key);
    return buildResponse<{ status: string }>(200, { status: 'ok' });
  } catch (err) {
    console.error(err);
    if (err instanceof BadRequestError) {
      return buildResponse(400, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
