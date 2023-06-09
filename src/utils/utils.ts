interface Headers {
  [key: string]: string | boolean | number;
}

export interface AppResponse {
  statusCode: number;
  headers: Headers;
  body: string;
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
