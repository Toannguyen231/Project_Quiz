const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env if it exists, or fallback to root .env
const serverEnvPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: serverEnvPath });

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'quizmaster_secret_jwt_key_2026_phase0';
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../data/quizmaster.db');

module.exports = {
    PORT,
    JWT_SECRET,
    DB_PATH,
};
