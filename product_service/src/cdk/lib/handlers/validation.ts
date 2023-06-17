import { BadRequestError } from '../models/errors';
import { CreateProductRequest } from './types';

export function validateCreateProductRequestBody({
  bodyObject,
}: {
  bodyObject: CreateProductRequest;
}): void {
  if (!('data' in bodyObject) || !('attributes' in bodyObject.data)) {
    throw new BadRequestError(400, 'Wrong body format');
  }
  const attributes = bodyObject.data.attributes;
  for (const property of ['price', 'title', 'description', 'count']) {
    if (!(property in attributes)) {
      throw new BadRequestError(400, `Request must have "${property}" value`);
    }
  }
  const priceNumber = Number(attributes.price);
  const countNumber = Number(attributes.count);

  if (Number.isNaN(priceNumber) || Number.isNaN(countNumber) || !Number.isInteger(countNumber)) {
    throw new BadRequestError(400, 'Wrong parameter types');
  }
  if (priceNumber <= 0) {
    throw new BadRequestError(400, '"price" must a positive number');
  }
  if (countNumber <= 0) {
    throw new BadRequestError(400, '"count" must a non-negative number');
  }
  const MAX_DESCRIPTION_LENGTH = 1024;
  const MAX_TITLE_LENGTH = 128;
  const stringProps: { name: 'title' | 'description'; maxLength: number }[] = [
    { name: 'description', maxLength: MAX_DESCRIPTION_LENGTH },
    { name: 'title', maxLength: MAX_TITLE_LENGTH },
  ];
  for (const { name, maxLength } of stringProps) {
    if (!attributes[name] || attributes[name].length > maxLength) {
      throw new BadRequestError(
        400,
        `"${name}" must not be empty or longer than ${maxLength} symbol(s)`
      );
    }
  }
}

export function parseCreateProductRequestBody({
  body,
}: {
  body: string | null;
}): CreateProductRequest {
  if (body === null) {
    throw new BadRequestError(400, 'Empty body');
  }
  const bodyObject: CreateProductRequest = JSON.parse(body);
  validateCreateProductRequestBody({ bodyObject });
  return bodyObject;
}
