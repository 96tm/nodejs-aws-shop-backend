import { CreateProductRequestAttributes } from '../types';

export interface CatalogBatchProcessItemResult
  extends CreateProductRequestAttributes {
  id: string;
}
