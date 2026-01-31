const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  logo: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Static methods for compatibility
brandSchema.statics.findAllForBikes = function() {
  return this.find({});
};

brandSchema.statics.findAll = async function(page = 1, limit = 10) {
  const numericLimit = Number(limit);
  const offset = (page - 1) * numericLimit;

  const [data, total] = await Promise.all([
    this.find({}).sort({ createdAt: -1 }).skip(offset).limit(numericLimit),
    this.countDocuments({}),
  ]);

  return {
    data,
    total,
    page: Number(page),
    limit: numericLimit,
    totalPages: Math.ceil(total / numericLimit),
  };
};

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;