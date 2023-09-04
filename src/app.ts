// Import necessary modules and types
import express, { Application } from 'express';
import { authenticateJWT } from './middleware/authenticate';
import userRouter from './routes/userRoutes';
import sequelize from './utils/database';
import feedRouter from './routes/feedRoutes';
import logRouter from './routes/logRoutes';
import User from './models/user';
import bcrypt from 'bcrypt';
import { generateAccessToken } from './controllers/userController';

// Create an Express application
const app: Application = express();
const port = process.env.PORT || 3000; // Set the port

// Middleware to parse JSON
app.use(express.json());

app.use('/user', authenticateJWT, userRouter);

app.use('/feed', authenticateJWT, feedRouter);

app.use('/log', authenticateJWT, logRouter);

sequelize
  .sync()
  .then(() => {
    app.listen(port, async () => {
      try {
        console.log(`******* Server is running on port ${port} *******`)
        const user = await User.findOne({
          where: {
            role: 'super-admin'
          }
        });

        if (!user) {
          bcrypt.hash("password", 10, async (err, hash) => {
            const user = await User.create({
              email: "johndoe@email.com",
              role: "super-admin",
              name: "John Doe",
              password: hash
            });
            console.log("User created successfully")
            console.log(generateAccessToken(1))
          });
        } else {
          bcrypt.hash("password", 10, async (err, hash) => {
            user.update({
              email: "johndoe@email.com",
              role: "super-admin",
              name: "John Doe",
              password: hash
            });
            user.save();
            console.log("User created successfully")
            console.log(generateAccessToken(1))
          });
        }

      } catch(err) {
        throw err;
      }
    });
  })
  .catch((err: any) => console.log(err));
