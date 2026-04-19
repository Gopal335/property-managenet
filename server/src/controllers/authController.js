import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

function publicPhoneFromEnv() {
  return (process.env.ADMIN_PUBLIC_PHONE || "").trim();
}

function buildToken(userId) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables.");
  }
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
}

function buildAuthResponse(user) {
  const token = buildToken(user._id.toString());
  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("name email");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getPublicAdminContact(req, res) {
  try {
    const user = await User.findOne().sort({ createdAt: 1 }).select("name email");
    if (!user) {
      return res.status(404).json({ message: "Contact is not available." });
    }
    return res.json({
      name: user.name,
      email: user.email,
      phone: publicPhoneFromEnv(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
