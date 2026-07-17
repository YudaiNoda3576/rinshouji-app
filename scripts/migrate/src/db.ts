/**
 * PostgreSQL 接続プール。DATABASE_URL 環境変数（既定は config）から生成する。
 */
import { Pool } from 'pg';
import { DEFAULT_DATABASE_URL } from './config.js';

export function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  return new Pool({ connectionString });
}
