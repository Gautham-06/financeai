import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import UserLogin from "./models/Item.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, req.body);
  next();
});

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Created uploads directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://talarigautham:gautham06@gautham.qp6apbf.mongodb.net/signins?retryWrites=true&w=majority&appName=gautham",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    console.log("Connected to MongoDB signins database");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit if cannot connect to database
  }
};

// Connect to MongoDB
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size should be less than 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("This response is from the backend server.");
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("Received registration request:", { username, email });

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if user already exists
    const existingUser = await UserLogin.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists"
      });
    }

    // Create new user
    const newUser = new UserLogin({
      username,
      email,
      password,
      role: 'user'
    });

    // Save user to database
    const savedUser = await newUser.save();
    

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message
    });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await UserLogin.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.json({
      success: true,
      message: "Signin successful",
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: "Error during signin",
      error: error.message
    });
  }
});

// File upload endpoints
app.post("/upload/bank-statement", upload.single('file'), async (req, res) => {
  try {
    console.log('Received bank statement upload request');
    
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('File received:', req.file);

    // Here you would typically save the file information to your database
    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadDate: new Date()
    };

    console.log('File info:', fileInfo);

    res.json({
      success: true,
      message: "File uploaded successfully",
      file: fileInfo
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message
    });
  }
});

app.post("/upload/form16", upload.single('file'), async (req, res) => {
  try {
    console.log('Received Form 16 upload request');
    
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('File received:', req.file);

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadDate: new Date()
    };

    console.log('File info:', fileInfo);

    res.json({
      success: true,
      message: "Form 16 uploaded successfully",
      file: fileInfo
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading Form 16",
      error: error.message
    });
  }
});

app.post("/upload/payslip", upload.single('file'), async (req, res) => {
  try {
    console.log('Received payslip upload request');
    
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('File received:', req.file);

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadDate: new Date()
    };

    console.log('File info:', fileInfo);

    res.json({
      success: true,
      message: "Payslip uploaded successfully",
      file: fileInfo
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading payslip",
      error: error.message
    });
  }
});

app.post("/upload/invoice", upload.single('file'), async (req, res) => {
  try {
    console.log('Received invoice upload request');
    
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('File received:', req.file);

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadDate: new Date()
    };

    console.log('File info:', fileInfo);

    res.json({
      success: true,
      message: "Invoice uploaded successfully",
      file: fileInfo
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading invoice",
      error: error.message
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
