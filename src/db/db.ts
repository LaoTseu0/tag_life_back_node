import { Pool, QueryResult, QueryResultRow } from 'pg';

// Configuration de la connexion
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tag_life',
  password: process.env.DB_PASSWORD || 'admin',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Export du pool de connexion
export default {
  query: <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> =>
    pool.query<T>(text, params),
};
