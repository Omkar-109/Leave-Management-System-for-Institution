import pg from "pg";
import env from "dotenv"

env.config();

//database connection object
const db = new pg.Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

// connect to the database
db.connect()
  .then(() => console.log('Connected to Postgres successfully'))
  .catch((err) => console.error('Postgres connection error:', err));

export default db;