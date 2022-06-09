const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter');
const truckRouter = require('./routes/truckRouter');
const loadRouter = require('./routes/loadRouter');

const uri = `mongodb+srv://${process.env.MONGODB_LOGIN}:${process.env.MONGODB_PASS}@cluster0.p8nd4.mongodb.net/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority`;
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
  console.log('Connected successfully');
});

exports.formattedTime = function() {
  const date = new Date();
  const result = `[${date.getHours()}:'${date.getMinutes()}:'${date.getSeconds()}] `;
  return result;
};

app.listen(process.env.PORT, () => {
  console.log('Server started on port: ' + process.env.PORT);
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/trucks', truckRouter);
app.use('/api/loads', loadRouter);