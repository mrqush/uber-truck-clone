const express = require('express');
const authController = require('./../controllers/authController');
const authRouter = express.Router();
const jsonParser = express.json();

authRouter.post('/register', jsonParser, authController.registerUser);
authRouter.post('/login', jsonParser, authController.authUser);

module.exports = authRouter;
