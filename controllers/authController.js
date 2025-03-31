import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import Joi from 'joi';

// Register user
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, type } = req.body;

  // Validate the user input with Joi
  const { error } = Joi.object({
    firstName: Joi.string().required().label('First Name'),
    lastName: Joi.string().required().label('Last Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().required().label('Password'),
    confirmPassword: Joi.string().required().label('confirmPassword'),
    type: Joi.string().valid('student', 'organizer').required().label('User Type'),
  }).validate(req.body);
  
  if (error) {
    return res.status(400).json({ success: false, msg: error.details[0].message });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, msg: "User with this email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ firstName, lastName, email, password: hashedPassword , confirmPassword : hashedPassword, type });
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({ success: true, token });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate the login input with Joi
  const { error } = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(req.body);

  if (error) {
    return res.status(400).json({ success: false, msg: error.details[0].message });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, msg: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, msg: "Invalid email or password" });

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return success response with user data
    res.json({
      success: true,
      token,
      user: { _id: user._id, type: user.type }, // Ensure user ID is included here
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export { registerUser, loginUser };