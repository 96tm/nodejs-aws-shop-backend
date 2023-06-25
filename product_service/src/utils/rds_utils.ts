import knex, { Knex } from 'knex';

import './load_env';

const dbOptions = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
};

export function getKnexClient(database = process.env.POSTGRES_NAME): Knex {
  return knex({
    client: 'pg',
    dialect: 'postgres',
    connection: { ...dbOptions, database },
  });
}
