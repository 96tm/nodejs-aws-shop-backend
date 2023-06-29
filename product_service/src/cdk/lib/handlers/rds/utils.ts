import { Client } from 'pg';
import { randomUUID } from 'crypto';

import { CreateProductRequest } from '../types';

export function getPgClient() {
  return new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_NAME,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT),
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export async function createProduct({
  productData,
}: {
  productData: CreateProductRequest;
}): Promise<string> {
  const tableNameProducts = process.env.APP_PRODUCTS_TABLE_NAME as string;
  const tableNameStocks = process.env.APP_STOCKS_TABLE_NAME as string;
  const client = getPgClient();
  const productId = randomUUID();
  const productAttributes = productData.data.attributes;
  await client.connect();
  const insertProductQuery = `
    INSERT INTO ${tableNameProducts}(id, title, description, price)
    VALUES ($1, $2, $3, $4);
  `;
  const insertStockQuery = `
    INSERT INTO ${tableNameStocks}(product_id, count)
    VALUES ($1, $2);
  `;
  try {
    await client.query('BEGIN');
    await client.query(`${insertProductQuery}`, [
      productId,
      productAttributes.title,
      productAttributes.description,
      productAttributes.price,
    ]);
    await client.query(`${insertStockQuery}`, [
      productId,
      productAttributes.count,
    ]);
    await client.query('COMMIT');
    return productId;
  } catch (e) {
    client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}
