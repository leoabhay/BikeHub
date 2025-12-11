const Brand = require("../models/Brand");

//Create Brand
const createBrand = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Logo file is required" });
    }

    const { name } = req.body;
    const logoPath = `/uploads/${req.file.filename}`;

    const brandId = await Brand.create(name, logoPath);
    const newBrand = await Brand.findById(brandId);

    res.status(201).json({
      msg: "Brand created successfully",
      brand: newBrand,
      redirectTo: "/add-model",
    });
  } catch (error) {
    res.status(500).json({ msg: "Error creating brand", error: error.message });
  }
};
//Get All Brand Record
const getBrandRecord = async (req, res) => {
  try {
    const brandRecord = await Brand.findAllForBikes();
    if (!brandRecord) {
      return res.status(404).json({ msg: "Brand not found" });
    }
    res
      .status(200)
      .json({ msg: "Brand retrive successfully", brands: brandRecord });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error fetching admin profile", error: error.msg });
  }
};

//Get All Brand with Pagination
const getBrandRecordWithPagination = async (req, res) => {
  try {
  
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ 
        msg: "Invalid pagination parameters",
        details: {
          receivedPage: req.query.page,
          receivedLimit: req.query.limit,
          parsedPage: page,
          parsedLimit: limit
        }
      });
    }

    const result = await Brand.findAll(page, limit);
    
    res.status(200).json({ 
      msg: "Brands retrieved successfully",
      brands: result.data,
      pagination: {
        total: result.total,
        currentPage: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      }
    });
  } catch (error) {
    console.error("Database error details:", error);
    res.status(500).json({ 
      msg: "Error fetching brands", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

//Get Brand By Id
const getBrandById = async (req, res) => {
  try {
    const brandId = req.params.id;
    console.log(brandId);

    const brandDataById = await Brand.findById(brandId);

    if (!brandDataById) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    res
      .status(200)
      .json({ msg: "Brand retrieved successfully", brand: brandDataById });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error fetching brand data", error: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    const existingBrand = await Brand.findById(brandId);
    if (!existingBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const { name } = req.body;
    const logoPath = req.file
      ? `/uploads/${req.file.filename}`
      : existingBrand.logo;

    await Brand.update(brandId, name, logoPath);
    const updatedBrand = await Brand.findById(brandId);

    res.status(200).json({
      msg: "Brand updated successfully",
      brand: updatedBrand,
      redirectTo: "/add-model",
    });
  } catch (error) {
    res.status(500).json({ msg: "Error updating brand", error: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    if (!brandId) {
      return res.status(400).json({ msg: "Invalid brand ID" });
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    const deletedRows = await Brand.delete(brandId);

    res.status(200).json({
      msg: "Brand deleted successfully",
      deleted: deletedRows > 0,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting brand", error: error.message });
  }
};

module.exports = {
  createBrand,
  getBrandRecordWithPagination,
  getBrandRecord,
  getBrandById,
  updateBrand,
  deleteBrand,
};