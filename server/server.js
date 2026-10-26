require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Library Management Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Server Port: http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Keep server running in dev
});
