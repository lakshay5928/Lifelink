const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const donorSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  age:              { type: Number, required: true, min: 18, max: 65 },
  gender:           { type: String, required: true, enum: ['Male', 'Female'] },
  bloodGroup:       { type: String, required: true, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
  state:            { type: String, required: true },
  city:             { type: String, required: true },
  lastDonationDate: { type: Date, required: true },
  contact:          { type: String, required: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:         { type: String, required: true },
  isAvailable:      { type: Boolean, default: true },
  isAdmin:          { type: Boolean, default: false },
  createdAt:        { type: Date, default: Date.now }
});

// Hash password
donorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

donorSchema.methods.matchPassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

// Eligibility virtual
donorSchema.virtual('isEligible').get(function() {
  const days = Math.floor((Date.now() - new Date(this.lastDonationDate)) / 86400000);
  return this.gender === 'Female' ? days >= 120 : days >= 90;
});

donorSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) { delete ret.password; return ret; }
});

module.exports = mongoose.model('Donor', donorSchema);
