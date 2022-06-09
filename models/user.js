const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userScheme = new Schema(
  {
    email: String,
    password: String,
    role: {
      type: String,
      enum: ['SHIPPER', 'DRIVER']
    },
    created_date: Date,
  }, { versionKey: false, collection: 'users' });

module.exports = mongoose.model('User', userScheme);
