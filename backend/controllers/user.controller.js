import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import "dotenv/config";

// Log in
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }

    // Match the stored password and user password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.json({ success: false, message: "Password not match" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// generate token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    // check if the user with the provided email id already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists!" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    // validating password strength
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be of 8 characters",
      });
    }
    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    // save new user in the database
    const user = await newUser.save();

    // generate token
    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { loginUser, registerUser };
