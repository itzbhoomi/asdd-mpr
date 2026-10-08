const app = require('./app');
const { testConnection } = require('./config/db');
require('dotenv').config();

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('[Warning] MySQL connection could not be established. Check DB credentials in .env.');
  }

  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  FoodFlow Backend Server running on port ${PORT}`);
    console.log(`  Health API: http://localhost:${PORT}/api/health`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
