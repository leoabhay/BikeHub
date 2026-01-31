const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  model_year: {
    type: String,
  },
  mileage: {
    type: String,
  },
  engine_cc: {
    type: String,
  },
  fuel_type: {
    type: String,
  },
  transmission: {
    type: String,
  },
  color: {
    type: String,
  },
  abs: {
    type: Boolean,
    default: false,
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// For compatibility with v.* and b.name in SELECT
vehicleSchema.virtual('brand_name', {
  ref: 'Brand',
  localField: 'brand_id',
  foreignField: '_id',
  justOne: true,
  get: function(brand) {
    return brand ? brand.name : null;
  }
});

// Static methods for compatibility
vehicleSchema.statics.findAll = async function(page = 1, limit = 10) {
  const numericLimit = Number(limit);
  const offset = (page - 1) * numericLimit;

  const [data, total] = await Promise.all([
    this.find({}).populate('brand_id').sort({ createdAt: -1 }).skip(offset).limit(numericLimit),
    this.countDocuments({}),
  ]);

  // Map to match existing structure (brand_name property)
  const mappedData = data.map(v => {
    const obj = v.toObject({ virtuals: true });
    return {
      ...obj,
      brand_name: obj.brand_id ? obj.brand_id.name : null
    };
  });

  return {
    data: mappedData,
    total,
    page: Number(page),
    limit: numericLimit,
    totalPages: Math.ceil(total / numericLimit),
  };
};

vehicleSchema.statics.findByBrandId = function(brandId) {
  return this.find({ brand_id: brandId });
};

vehicleSchema.statics.search = async function(filters) {
  const { name, brand, model, model_year, min_price, max_price, sort_by, sort_order } = filters;
  
  const query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }
  if (brand) {
    query.brand_id = brand;
  }
  if (model) {
    // Assuming model is part of name or you can add a model field if needed
    query.name = { $regex: model, $options: 'i' };
  }
  if (model_year) {
    query.model_year = model_year;
  }
  if (min_price || max_price) {
    query.price = {};
    if (min_price) query.price.$gte = Number(min_price);
    if (max_price) query.price.$lte = Number(max_price);
  }

  const sort = {};
  if (sort_by && sort_order) {
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const results = await this.find(query).populate('brand_id').sort(sort);
  
  return results.map(v => {
    const obj = v.toObject({ virtuals: true });
    return {
      ...obj,
      brand_name: obj.brand_id ? obj.brand_id.name : null
    };
  });
};

vehicleSchema.statics.getStats = async function() {
  const [total, petrol, electric, avgPriceResult] = await Promise.all([
    this.countDocuments({}),
    this.countDocuments({ fuel_type: 'Petrol' }),
    this.countDocuments({ fuel_type: 'Electric' }),
    this.aggregate([{ $group: { _id: null, avgPrice: { $avg: '$price' } } }])
  ]);

  return {
    total,
    petrol,
    electric,
    avgPrice: avgPriceResult.length > 0 ? Math.round(avgPriceResult[0].avgPrice) : 0
  };
};

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;