const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Conectado OK, hora DB:', res.rows[0]);
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error conectando a Postgres:', err.message || err);
    process.exit(1);
  }
})();