import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { getUserRole } from './feedController';
import * as dotenv from 'dotenv';
dotenv.config();
import { logOperation } from '../utils/log';

export const generateAccessToken = (id: number): string => jwt.sign({id: id}, process.env.SECRET_KEY as Secret);

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const userDetails = req.body;
  const userEmail = userDetails.email;

  const role = await getUserRole(req.user?.id);

  if (userDetails.role == 'admin' && role != 'super-admin' || userDetails.role == 'basic' && role == 'basic') {
    return res.status(500).json({
      message: "Not Authorised to create new user"
    });
  }

  try {
    logOperation(`Creating a new user with email: ${userEmail}`);

    const user = await User.findOne({
      where: {
        email: userEmail,
      }
    });

    if (user) {
      return res.status(500).json({
        message: "User already exists"
      });
    } 

    if (userDetails.role == 'super-admin') {
      const superAdminUser = await User.findOne({
        where: {
          role: 'super-admin'
        }
      });

      if (superAdminUser) {
        return res.status(500).json({
          message: "Super admin already exists"
        });
      }
    }

    bcrypt.hash(userDetails.password, 10, async (err, hash) => {
      const user = await User.create({
        ...userDetails,
        password: hash,
      });

      logOperation(`User with email: ${userEmail} created successfully`);
      return res.status(201).json({
        message: "User created successfully",
        token: generateAccessToken(user.id as number),
      });
    });
  } catch(err: any) {
    logOperation(`User creation failed: ${err.message}`);
    return res.status(404).json({
      message: "User creation failed " + err as string
    });
  }
}

export const readUser = async (req: AuthenticatedRequest, res: Response) => {
  const userDetails = req.body;
  const userEmail = userDetails.email;
  try {
    logOperation(`Reading a user with email: ${userEmail}`);

    const user = await User.findOne({
      where: {
        email: userEmail,
      }
    });

    if (!user) {
      return res.status(500).json({
        message: "User does not exist"
      });
    } 

    logOperation(`User with email: ${userEmail} read successfully`);
    return res.status(201).json({
      message: JSON.stringify(user),
    });
  } catch(err: any) {
    logOperation(`User read failed: ${err.message}`);
    return res.status(404).json({
      message: "User reading failed " + err as string
    });
  }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const userDetails = req.body;
  const userEmail = userDetails.email;

  if (userDetails.role == 'admin' && req.user?.role != 'super-admin') {
    return res.status(500).json({
      message: "Not Authorised to update an admin"
    });
  }

  try {
    logOperation(`Updating a user with email: ${userEmail}`);

    const user = await User.findOne({
      where: {
        email: userEmail,
      }
    });

    if (!user) {
      return res.status(500).json({
        message: "User does not exist"
      });
    } 

    user.set(userDetails);
    await user.save();
    
    logOperation(`User with email: ${userEmail} updated successfully`);
    return res.status(201).json({
      message: `User ${userDetails.name} updated created successfully`,
    });
  } catch(err: any) {
    logOperation(`User updation failed: ${err.message}`);
    return res.status(404).json({
      message: "User updaetion failed " + err as string
    });
  }
}

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const userDetails = req.body;
  const userEmail = userDetails.email;

  if (userDetails.role == 'admin' && req.user?.role != 'super-admin') {
    return res.status(500).json({
      message: "Not Authorised to delete an admin"
    });
  }

  try{
      logOperation(`Deleting a user with email: ${userEmail}`);

      const user = await User.findOne({
        where: {
          email: userEmail,
        }
      });
  
      if (!user) {
        return res.status(500).json({
          message: "User does not exist"
        });
      }  

      await user.destroy();

      logOperation(`User with email: ${userEmail} deleted successfully`);
      return res.status(500).json({
        mesage: `Deleted the user ${userEmail}`
      });

  } catch(err: any) {
    logOperation(`User deletion failed: ${err.message}`);
    return res.status(404).json({
      message: "User deletion failed " + err as string
    });
  } 
}

