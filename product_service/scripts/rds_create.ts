import { getKnexClient } from '../src/utils/rds_utils';

import '../src/utils/load_env';

async function createDatabase(): Promise<void> {
  try {
    const client = getKnexClient('template1');
    const result = await client.raw(
      `CREATE DATABASE ${process.env.POSTGRES_NAME};`
    );
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function createProductsTable(): Promise<void> {
  const tableName = 'products';
  try {
    const client = getKnexClient();
    const result = await client.schema.createTable(tableName, (table) => {
      table.uuid('id').primary();
      table.string('title', 128).notNullable();
      table.string('description', 1024).notNullable();
      table.decimal('price', 9, 2).checkPositive().notNullable();
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function createStocksTable(): Promise<void> {
  const tableName = 'stocks';
  try {
    const client = getKnexClient();
    const result = await client.schema.createTable(tableName, (table) => {
      table.uuid('product_id').primary().references('products.id');
      table.integer('count').notNullable();
      table.check('?? >= 0', ['count']);
    });
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  await createDatabase();
  await createProductsTable();
  await createStocksTable();
  process.exit();
})();
