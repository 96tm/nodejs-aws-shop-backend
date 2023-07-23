import express, { Application, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';

import './utils/load_env';

import { RECIPIENTS, isValidServiceName, PORT } from './utils/constants';
import { makeErrorResponse } from './utils/responses';

const app: Application = express();

app.use(express.json());

app.use('/*', async (req: Request, res: Response): Promise<void> => {
  const { body, method, originalUrl } = req;
  const serviceName = originalUrl.split('/')[1];
  if (!isValidServiceName(serviceName)) {
    res.status(StatusCodes.BAD_GATEWAY).send(makeErrorResponse());
    return;
  }
  const recipientUrl = RECIPIENTS[serviceName];
  const requestConfig = {
    method,
    body,
    url: `${recipientUrl}/${originalUrl.split('/').slice(2).join('')}`,
    ...(Object.keys(body || {}).length > 0 && { data: body }),
  };
  try {
    const response = await axios(requestConfig);
    res.status(response.status).json(response.data);
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      res.status(e.response.status).json(e.response.data);
    } else {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(status).send(
        makeErrorResponse({
          detail: 'Internal server error',
          status: `${status}`,
          code: 'server_error',
        })
      );
    }
  }
});

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT);
});
