const Vehicle = require("../models/Vehicle");
const createVehicle = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      model_year,
      mileage,
      engine_cc,
      fuel_type,
      transmission,
      color,
      abs,
      brand_id,
    } = req.body;

    if (!name || !brand_id) {
      return res.status(400).json({ error: "Name and Brand are required" });
    }

    let imageString = null;
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.filename);
      imageString = images.join(",");
    }

    // Create vehicle with all fields
    const newVehicle = await Vehicle.create({
      name,
      description: description || null,
      price: price ? parseFloat(price.toString().replace(/[^\d.]/g, '')) : null,
      image: imageString,
      model_year: model_year || null,
      mileage: mileage || null,
      engine_cc: engine_cc || null,
      fuel_type: fuel_type || null,
      transmission: transmission || null,
      color: color || null,
      abs: abs !== undefined ? (parseInt(abs, 10) === 1) : false,
      brand_id,
    });

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle: newVehicle,
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllProducts = async (req, res) => {
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
          parsedLimit: limit,
        },
      });
    }

    const result = await Vehicle.findAll(page, limit);

    if (!result) {
      return res.status(404).json({ msg: "Vehicles not found" });
    }
    res.status(200).json({
      msg: "Vehicles fetched successfully",
      vehicles: result.data,
      pagination: {
        total: result.total,
        currentPage: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  } catch (error) {
    console.error("Database error details:", error);
    res
      .status(500)
      .json({
        msg: "Error fetching vehicle data",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = await Vehicle.findById(productId);
    if (!productData) {
      return res.status(400).json({ msg: "Vehicle not found" });
    }
    res
      .status(200)
      .json({ msg: "Vehicle fetched successfully", vehicle: productData });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching data", error: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Vehicle.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const {
      name,
      description,
      price,
      model_year,
      mileage,
      engine_cc,
      fuel_type,
      transmission,
      color,
      abs,
      brand_id,
    } = req.body;

    let imageString = existingProduct.image;
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.filename);
      imageString = images.join(",");
    }

    // Create an object with only the provided fields
    const vehicleData = {
      name,
      description,
      price: price ? parseFloat(price.toString().replace(/[^\d.]/g, '')) : undefined,
      model_year,
      mileage,
      engine_cc,
      fuel_type,
      transmission,
      color,
      abs: abs !== undefined ? (parseInt(abs, 10) === 1) : undefined,
      brand_id,
      image: imageString,
    };

    // Remove undefined fields
    Object.keys(vehicleData).forEach(key => vehicleData[key] === undefined && delete vehicleData[key]);

    const updatedProduct = await Vehicle.findByIdAndUpdate(productId, vehicleData, { new: true });
    res.status(200).json({
      msg: "Vehicle updated successfully",
      vehicle: updatedProduct,
      redirectTo: "/",
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error updating vehicle", error: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const productId = req.params.id;
    await Vehicle.findByIdAndDelete(productId);
    res.status(200).json({ msg: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting vehicle", error: error.message });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("Fetching vehicle with ID:", productId); // Debugging

    // Fetch the current vehicle details
    const currentVehicle = await Vehicle.findById(productId);
    if (!currentVehicle) {
      console.log("Vehicle not found in database"); // Debugging
      return res.status(404).json({ msg: "Vehicle not found" });
    }

    console.log("Current vehicle:", currentVehicle); // Debugging

    // Fetch related vehicles (e.g., vehicles from the same brand)
    const relatedProducts = await Vehicle.findByBrandId(
      currentVehicle.brand_id
    );
    console.log("Related vehicles:", relatedProducts); // Debugging

    // Exclude the current vehicle from the related products
    const filteredRelatedProducts = relatedProducts.filter(
      (vehicle) => vehicle._id.toString() !== productId
    );

    res.status(200).json({
      msg: "Related vehicles fetched successfully",
      relatedProducts: filteredRelatedProducts,
    });
  } catch (error) {
    console.error("Error fetching related vehicles:", error); // Debugging
    res.status(500).json({
      msg: "Error fetching related vehicles",
      error: error.message,
    });
  }
};

const searchVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.search(req.query);

    res.status(200).json({
      msg: "Vehicles fetched successfully",
      vehicles,
    });
  } catch (error) {
    console.error("Error searching vehicles:", error);
    res.status(500).json({
      msg: "Error searching vehicles",
      error: error.message,
    });
  }
};

module.exports = {
  createVehicle,
  getAllProducts,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getRelatedProducts,
  searchVehicles,
};