// importing required modules
const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config(); // Add this at the very top

// const express = require('express');
// ... rest of your imports
// Import routes
const { servicesControl, userControl, societyControl, complaintControl, paymentControl,citiesControl, postsControl } = require('./routes/routes');

// Configure body parser for larger requests
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// Make incoming data in JSON format
app.use(express.json());

// Use CORS middleware
// In your backend index.js
// const cors = require('cors');

// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://waste-x-gamma.vercel.app"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );


app.use(
  cors({
    origin: ["http://localhost:5173", "https://waste-x-gamma.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


// const mongoose = require("mongoose");

// Ensure MONGO_URI is not undefined
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected! 🚀"))
  .catch((err) => console.error("MongoDB connection failed:", err));

 
// Define routes
app.use('/services', servicesControl);
app.use('/user', userControl);
app.use('/society', societyControl);
app.use('/complaint', complaintControl);
app.use('/pay', paymentControl);
app.use('/cities', citiesControl);
app.use('/posts',postsControl)

// Define a basic route
app.get('/', (req, res) => {
    res.send("Home Page!");
});

// Listening the server!
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
