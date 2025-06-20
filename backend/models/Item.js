import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userLoginSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  }
}, {
  timestamps: true,
  collection: 'users' // Explicitly set collection name
});

// Add index for faster queries
userLoginSchema.index({ email: 1 });
userLoginSchema.index({ username: 1 });

const UserLogin = model('UserLogin', userLoginSchema);

export default UserLogin;