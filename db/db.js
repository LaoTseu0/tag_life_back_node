// Connexion à PostgreSQL
const { Pool } = require("pg");

// Configuration de la connexion
const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "tag_life",
  password: "admin",
  port: 5432,
});

// Export du pool de connexion
module.exports = {
  query: (text, params) => pool.query(text, params),
};
