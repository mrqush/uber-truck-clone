const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const app = require('../app');

exports.registerUser = async function (req, res) {
  try {
    if (!req.body) {
      throw new Error('Invalid value');
    }
    const { email, role } = req.body;
    const checkUser = await User.find({ email: email });
    if (checkUser.length) {
      throw new Error('User with this email is already registered');
    }
    if (!role) {
      throw new Error('User must have a role');
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    const date = new Date();
    let user = new User({
      email: email,
      role: role.toUpperCase(),
      password: password,
      created_date: date,
    });

    user = await user.save();
    res.status(200).send({
      message: 'Profile created successfully'
    });
    console.log(app.formattedTime() + 'Registered user: ' + user._id);
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
    console.error(app.formattedTime() + err);
  }
};

exports.authUser = async function (req, res) {
  try {
    if (!req.body || !req.body.password) {
      throw new Error('Invalid value');
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error('User are not found');
    }
    const passwordResult = bcrypt.compareSync(password, user.password);
    if (!passwordResult) {
      throw new Error('Password is incorrect');
    }

    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET);

    res.status(200).json({
      jwt_token: token
    });
    console.log(app.formattedTime() + 'Login user: ' + user._id);
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
    console.error(app.formattedTime() + err);
  }
};
