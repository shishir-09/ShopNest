const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.json());


mongoose.connect('mongodb+srv://shishirmitra0109:NWAfBTADIuRgr4Ym@rapid.34mkx.mongodb.net/?retryWrites=true&w=majority&appName=rapid');
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));


app.delete('/:id', async (req, res) => {
  const id = req.params.id;
 await User.findByIdAndDelete(id);
  res.json('Delete successfully');
});

//TODO:  this


app.listen(port, () => {
  console.log(`Server is running on :${port}`);
});



const { Schema, model } = mongoose;
const userSchema = new Schema({
  name: String,
  age: Number,
  email: String
});
const User = model('User', userSchema);