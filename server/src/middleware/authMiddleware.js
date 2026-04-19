import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: "JWT_SECRET is missing in environment variables." });
    }

    const payload = jwt.verify(token, jwtSecret);
    req.user = { userId: payload.userId };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
