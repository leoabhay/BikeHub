const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Static methods for compatibility with existing controllers
adminSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

adminSchema.statics.updatePassword = function(id, newPassword) {
  return this.findByIdAndUpdate(id, { password: newPassword });
};

adminSchema.statics.updateProfile = function(id, phone_number, address) {
  return this.findByIdAndUpdate(id, { phone_number, address });
};

// Override create to match MySQL implementation if needed, 
// but Mongoose's Model.create already works similarly.
// The existing controllers call Admin.create(username, password, phone_number, address, role)
const originalCreate = adminSchema.statics.create;
adminSchema.statics.createAdmin = function(username, password, phone_number, address, role = 'admin') {
  return new this({ username, password, phone_number, address, role }).save();
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;