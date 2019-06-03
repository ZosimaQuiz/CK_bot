//  Connect Mongoose 
const mongoose = require('mongoose');
//  Declare schema as property Mongoose 
const Schema = mongoose.Schema;
//  Model mongo
const model = {
  userID: Number,
  gangID: Number,
  username: String,
  nickname: String,
  defend: String,
  free: String,
  heal: String,
  timer: Number,
  isLeader: Boolean,
  isAdmin: Boolean,
  isMember: Boolean,
  language: String  
}
//  Determine schema with propertys and data type, determine collection
const KnightXSchema = new Schema(model, { collection: 'KnightX' }),
      X_BANDSchema = new Schema(model, { collection: 'X-BAND' });
//  Create and export model
const KnightX = mongoose.model('KnightX', KnightXSchema),
      X_BAND  = mongoose.model('X-BAND', X_BANDSchema);

let modelArray = [KnightX, X_BAND];

module.exports = modelArray;