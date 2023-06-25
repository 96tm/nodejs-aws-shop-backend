interface Headers {
  [key: string]: string | boolean | number;
}

export interface AppResponse {
  statusCode: number;
  headers: Headers;
  body: string;
}

export interface ErrorData {
  error: {
    detail: string;
  };
}

export function buildResponse<T>(
  statusCode: number,
  body: T,
  headers: Headers = {}
): AppResponse {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function buildServerErrorResponse<T extends ErrorData>(
  body?: T,
  headers: Headers = {}
): AppResponse {
  const defaultResponse = {
    error: { detail: 'Internal Server Error' },
  } as T;
  return buildResponse<ErrorData>(500, body || defaultResponse, headers);
}
