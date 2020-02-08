const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name, email , photo , password, passwordConfirm
//creating user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'please provide a name'] },
  email: {
    type: String,
    required: [true, 'please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide an valide email']
  },
  photo: { type: String },
  password: { type: String, required: true, minlength: 8, select: false },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      //only works for saving
      validator: function(el) {
        return el === this.password; //returns true or false for this statement
      },
      message: 'passwords are not the same!'
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  //só entra aqui se a senha tiver sido alterada
  if (!this.isModified('password')) return next();
  //hashing the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//testing if the password is correct
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedtimestamp = parseInt(
      this.passwordchangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedtimestamp;
  }
  return false;
};

//creating user model
const User = mongoose.model('User', userSchema);

//exporting user model
module.exports = User;
