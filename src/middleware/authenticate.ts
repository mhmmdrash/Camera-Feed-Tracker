import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JwtPayload, Jwt } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

// Define a secret key for JWT
const JWT_SECRET = process.env.SECRET_KEY as Secret; // Replace with your actual secret key

// Define a function to verify JWT tokens
const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
  }

// Middleware for JWT authentication
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  try {
    const decodedToken = await verifyToken(token);

    // Attach the decoded token to the request for future use
    req.user = decodedToken as JwtPayload;

    // Move on to the next middleware or route handler
    next();
  } catch (error) {
    // throw error;
    return res.status(401).json({ message: `Invalid token: ${error}` });
  }
};
