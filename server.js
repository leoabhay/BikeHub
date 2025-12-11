const pool = require('./config/db'); 
const app = require("./app");
const PORT = process.env.PORT || 5050;

async function testDatabaseConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Database connection successful:'); 
  } catch (error) {
    console.error('Database connection failed:', error); 
  }
}

testDatabaseConnection();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});