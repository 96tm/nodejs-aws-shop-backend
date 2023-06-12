import { getKnexClient } from '../../utils/rds_utils';

import { mockProducts } from '../cdk/lib/mocks/products';
import { mockStocks } from '../cdk/lib/mocks/stocks';

import '../../utils/load_env';

async function seedProductsTable(): Promise<void> {
  const tableName = 'products';
  try {
    const result = await getKnexClient().table(tableName).insert(mockProducts);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function seedStocksTable(): Promise<void> {
  const tableName = 'stocks';
  try {
    const result = await getKnexClient().table(tableName).insert(mockStocks);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  await seedProductsTable();
  await seedStocksTable();
  process.exit();
})();
