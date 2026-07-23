const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log("Testing connection to:", uri.replace(/:([^:@]+)@/, ':<hidden>@')); // hide password

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ Success! Connected to MongoDB.");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Failed to connect:", err);
    process.exit(1);
  });
