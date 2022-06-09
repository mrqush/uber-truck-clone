const express = require('express');
const loadController = require('./../controllers/loadController');
const loadRouter = express.Router();
const jsonParser = express.json();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const app = require('../app');

loadRouter.use((req, res, next) => {
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

loadRouter.get('/', loadController.getLoads);
loadRouter.post('/', jsonParser, loadController.addLoad);
loadRouter.get('/active', loadController.getActiveLoad);
loadRouter.get('/:id', loadController.getLoadById);
loadRouter.put('/:id', jsonParser, loadController.updateLoad);
loadRouter.delete('/:id', loadController.deleteLoad);
loadRouter.post('/:id/post', loadController.postLoad);
loadRouter.get('/:id/shipping_info', loadController.getLoadShippingInfo);
loadRouter.patch('/active/state', loadController.iterateLoadState);

module.exports = loadRouter;
