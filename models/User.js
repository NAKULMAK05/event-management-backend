import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

// User Schema definition
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, enum: ["student", "organizer"], required: true },
  photo: { type: String, default: "https://via.placeholder.com/150" },
});

// Generate JWT Token
userSchema.methods.generateAuthToken = function () {
  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Log to check if the secret is loaded
    return jwt.sign(
      { _id: this._id, email: this.email, type: this.type },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error("Error generating JWT");
  }
};

// Update Profile Method
userSchema.methods.updateProfile = async function (profileData) {
  try {
    this.firstName = profileData.firstName || this.firstName;
    this.lastName = profileData.lastName || this.lastName;
    this.email = profileData.email || this.email;
    this.photo = profileData.photo || this.photo;

    await this.save();
    return this;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Profile update failed");
  }
};

// Create User Model
const User = mongoose.model("User", userSchema);

// Validation for User Registration
const validateUser = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    type: Joi.string().valid("student", "organizer").required().label("User Type"),
  });

  return schema.validate(data);
};

export { User, validateUser };
