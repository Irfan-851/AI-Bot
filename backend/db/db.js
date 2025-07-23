require('dotenv').config();
const mongoose = require('mongoose');

if (!process.env.URL) {
  console.error('MongoDB connection URL is not set in .env file!');
  process.exit(1);
}

mongoose.connect(process.env.URL)
  .then(() => console.log('Connected to database'))
  .catch((err) => {
    console.error('Error in database connection', err);
    process.exit(1);
  });

module.exports = mongoose;



