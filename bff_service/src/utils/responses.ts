interface ApiError {
  detail: string;
  status: string;
  code: string;
}

export function makeErrorResponse(error?: ApiError): ApiError {
  return (
    error || {
      detail: 'Unable to process request',
      status: '502',
      code: 'unknown_request',
    }
  );
}
