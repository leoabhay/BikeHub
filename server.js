const connectDB = require('./config/db'); 
const app = require("./app");
const PORT = process.env.PORT || 5050;

// Connect to Database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});