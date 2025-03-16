require("dotenv").config();

// Import required modules
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mailgen = require("mailgen");

// Require routers
const userControl = express.Router();
const societyControl = express.Router();
const complaintControl = express.Router();
const paymentControl = express.Router();
const servicesControl = express.Router();
const citiesControl = express.Router();
const postsControl = express.Router();




// Body parser configuration
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

complaintControl.use(bodyParser.json({ limit: "50mb" }));
complaintControl.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Razorpay configuration (corrected)
// const Razorpay = require("razorpay");
// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const Society = require("../models/society");
const Complaint = require("../models/complaints.js");
const Payment = require("../models/razorpay");
const ExpressError = require("../utils/ExpressError");
const {
  userValidation,
  societyValidation,
  complaintValidation,
  postValidation,
} = require("../utils/validation");

const mongoose = require("mongoose");
const crypto = require("crypto");
const Cities = require("../models/cities.js");
const Post = require("../models/posts.js");

// Configure express middleware
app.use(express.json());
userControl.use(express.json());
servicesControl.use(express.json());
societyControl.use(express.json());
complaintControl.use(express.json());
paymentControl.use(express.json());
citiesControl.use(express.json());
postsControl.use(express.json());

// functions for verifications
const validateUser = (req, res, next) => {
  let { error } = userValidation.validate(req.body);
  if (error) {
    throw new ExpressError(400, `joi, ${error}`);
  } else {
    next();
  }
};

const validateSociety = (req, res, next) => {
  let { error } = societyValidation.validate(req.body);
  if (error) {
    throw new ExpressError(400, `joi, ${error}`);
  } else {
    next();
  }
};

const validateComplaint = (req, res, next) => {
  let { error } = complaintValidation.validate(req.body);
  if (error) {
    throw new ExpressError(400, `joi, ${error}`);
  } else {
    next();
  }
};

const validatePost = (req, res, next) => {
  let { error } = postValidation.validate(req.body);
  if (error) {
    throw new ExpressError(400, `joi, ${error}`);
  } else {
    next();
  }
};

const jwtVerify = (req, res, next) => {
  try {
    let { authorization } = req.headers;
    let result = jwt.verify(authorization, process.env.JWT_PASS);
    // console.log(result.username);
    next();
  } catch (err) {
    throw new ExpressError(
      403,
      "Not authorised to access this route without correct auth token"
    );
  }
};

// ========================================================
// USERS ROUTES
// ========================================================

// route for signing up
userControl.post(
  "/signup",
  validateUser,
  wrapAsync(async (req, res) => {
    let { username, name, password, address, society, contact } = req.body;
    let checkSociety = await Society.find({ name: society });
    if (checkSociety.length == 0) {
      throw new ExpressError(404, "Society not Found!");
    }
    let insertData = new User({ username, name, password, address, contact });
    insertData.society = checkSociety[0];
    await insertData.save();

    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    };

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new mailgen({
      theme: "salted",
      product: {
        name: "WasteX",
        logo: "https://freepngimg.com/save/27098-welcome-clipart/1584x698",
        link: "https://wastex-x.vercel.app/",
      },
    });

    let response = {
      body: {
        title: "Welcome to WasteX",
        name: "User",
        intro: "Your account has been successfully created on WasteX! :)",
        signature: "Sincerely, Team WasteX",
        action: [
          {
            instructions: "Click here to go to WasteX",
            button: {
              color: "#22BC66",
              text: "WasteX",
              link: "https://wastex.vercel.app/",
            },
          },
        ],
      },
    };

    let mail = MailGenerator.generate(response);

    let message = {
      from: process.env.EMAIL,
      to: contact.email,
      subject: "Welcome to WasteX!",
      html: mail,
    };

    transporter
      .sendMail(message)
      .then(() => {
        res.status(201).json({
          msg: "Sent Mail!",
          token: jwt.sign(
            { username: req.body.username },
            process.env.JWT_PASS
          ),
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Failed to send email" });
      });
  })
);

// user login route
userControl.post(
  "/api/user/login",
  wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  })
);
// route for returning a user
userControl.get("/:id", async (req, res) => {
  let { id } = req.params;
  let result = await User.findById(id);
  if (result == null) {
    res.status(404).json("Post not Found!");
  }
  res.send(result);
});

// returns if any error occurs
userControl.use((err, req, res, next) => {
  let { status = 500, message = "Some error occured..!" } = err;
  res.status(status).send(err.message);
});

// ========================================================
// SOCIETY ROUTES
// ========================================================

// route for new society
societyControl.post(
  "/new",
  validateSociety,
  wrapAsync(async (req, res) => {
    let insertData = new Society(req.body);
    await insertData.save();
    console.log("Added");
    res.send("Success!");
  })
);

// route for getting all society
societyControl.get(
  "/",
  wrapAsync(async (req, res) => {
    const data = await Society.find();
    res.send(data);
  })
);

// route for getting specific society
societyControl.get("/:id", async (req, res) => {
  let { id } = req.params;
  let result = await Society.findById(id);
  if (result == null) {
    res.status(404).json("Society not Found!");
  }
  res.send(result);
});

// route for editing society
societyControl.put(
  "/edit/:id",
  validateSociety,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    let updatedData = await Society.findByIdAndUpdate(id, newData);
    if (updatedData === null || updatedData === undefined) {
      throw new ExpressError(404, "Society not found");
    }
    res.send("Updated!");
  })
);

societyControl.get("/details/:id", async (req, res) => {
  let { id } = req.params;
  let result = await Society.findById(id);
  let result2 = await User.find({ society: id });
  // console.log("result: ", result);
  // console.log("result2: ", result2);
  res.json({ societyData: result, residentsData: result2 });
});

// ========================================================
// COMPLAINT ROUTES
// ========================================================

complaintControl.get(
  "/",
  wrapAsync(async (req, res) => {
    const data = await Complaint.find();
    res.send(data);
  })
);

complaintControl.post(
  "/new",
  validateComplaint,
  wrapAsync(async (req, res) => {
    let insertData = new Complaint(req.body);
    await insertData.save();
    console.log("Added");
    res.send("Success!");
  })
);
complaintControl.use((err, req, res, next) => {
  console.log(err);
  let { status = 500, message = "Some error occured..!" } = err;
  res.status(status).send(err.message);
});

// ========================================================
// PAYMENT ROUTES
// ========================================================
const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: "your_key_id",
  key_secret: "your_key_secret",
});


// paymentControl.post(
//   "/checkout",
//   wrapAsync(async (req, res) => {
//     const options = {
//       amount: Number(req.body.amount * 100),
//       currency: "INR",
//     };
//     const order = await razorpayInstance.orders.create(options);
//     res.status(200).json({ success: true, order });
//   })
// );




paymentControl.post(
  "/checkout",
  wrapAsync(async (req, res) => {
    try {
      const options = {
        amount: Number(req.body.amount) * 100,
        currency: "INR",
      };
      const order = await razorpayInstance.orders.create(options);
      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error("Razorpay Error:", error);
      res.status(500).json({ success: false, message: "Payment failed" });
    }
  })
);

paymentControl.get("/getkey", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

citiesControl.get(
  "/",
  wrapAsync(async (req, res) => {
    let result = await Cities.find();
    res.send(result);
  })
);

citiesControl.use((err, req, res, next) => {
  let { status = 500, message = "Some error occured..!" } = err;
  res.status(status).send(err.message);
});

postsControl.get(
  "/",
  wrapAsync(async (req, res) => {
    let result = await Post.find();
    if (result.length == 0) {
      throw new ExpressError(404, "no posts found");
    }
    res.send(result);
  })
);

postsControl.post(
  "/",
  validatePost,
  wrapAsync(async (req, res) => {
    let newPost = new Post(req.body);
    await newPost.save();
    res.send("added");
  })
);

postsControl.use((err, req, res, next) => {
  let { status = 500, message = "Some error occured..!" } = err;
  res.status(status).send(err.message);
});


module.exports = {
  userControl,
  societyControl,
  servicesControl,
  paymentControl,
  complaintControl,
  citiesControl,
  postsControl,
};