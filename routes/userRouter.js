const express = require('express');
require('dotenv').config()
const userController = require('../controllers/userController');
const userRouter = express.Router();
const jsonParser = express.json();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const app = require('../app');

userRouter.use((req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) {
      throw new Error('Invalid token');
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
      if (err) throw err;
      const user = await User.findOne({ _id: userData._id });
      if (!user) {
        throw new Error('User not found');
      }
      req.user = user;
      next();
    }).catch(err => {
      res.status(400).send({
        message: err.message
      });
      console.error(app.formattedTime() + err);
    });
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
    console.error(app.formattedTime() + err);
  }
});

userRouter.get('/me', userController.getUser);
userRouter.delete('/me', userController.deleteUser);
userRouter.patch('/me/password', jsonParser, userController.changePassword);

module.exports = userRouter;
