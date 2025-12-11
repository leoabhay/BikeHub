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

    // Create vehicle with all fields, converting undefined to null where needed
    const vehicleId = await Vehicle.create({
      name,
      description: description || null,
      price: price ? parseFloat(price) : null,
      image: imageString,
      model_year: model_year || null,
      mileage: mileage || null,
      engine_cc: engine_cc || null,
      fuel_type: fuel_type || null,
      transmission: transmission || null,
      color: color || null,
      abs: abs !== undefined ? (abs ? 1 : 0) : 0, // Default to 0 if not provided
      brand_id,
    });

    const newVehicle = await Vehicle.findById(vehicleId);

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
const getAllPrduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 1) || 1;
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
      return res.status(400).json({ msg: "Vehicle not found" });
    }
    res.status(200).json({
      msg: "Vehicle fetching successfully",
      vehicle: result.data,
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
    console.log("Database error details", error);
    res
      .status(500)
      .json({
        msg: "Error fetching vehicle data",
        error: error.msg,
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
      .json({ msg: "Vehicle fetching successfully", vehicle: productData });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching data", error: error.msg });
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
      price,
      model_year,
      mileage,
      engine_cc,
      fuel_type,
      transmission,
      color,
      abs: abs !== undefined ? (abs ? 1 : 0) : undefined,
      brand_id,
      image: imageString,
    };

    for (const key in vehicleData) {
      if (vehicleData[key] === undefined) {
        delete vehicleData[key];
      }
    }

    await Vehicle.update(productId, vehicleData);

    const updatedProduct = await Vehicle.findById(productId);
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
    await Vehicle.delete(productId);
    res.status(200).json({ msg: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting admin", error: error.msg });
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
      (vehicle) => vehicle.id !== productId
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
    // Extract query parameters
    const {
      name,
      brand,
      model,
      model_year,
      min_price,
      max_price,
      sort_by,
      sort_order,
    } = req.query;

    // Base query
    let query = `
      SELECT * FROM vehicles
      WHERE 1=1
    `;

    // Array to hold parameter values
    const params = [];

    // Add filters based on query parameters
    if (name) {
      query += ` AND name LIKE ?`;
      params.push(`%${name}%`);
    }
    if (brand) {
      query += ` AND brand_id = ?`;
      params.push(brand);
    }
    if (model) {
      query += ` AND model LIKE ?`;
      params.push(`%${model}%`);
    }
    if (model_year) {
      query += ` AND model_year = ?`;
      params.push(model_year);
    }
    if (min_price) {
      query += ` AND price >= ?`;
      params.push(min_price);
    }
    if (max_price) {
      query += ` AND price <= ?`;
      params.push(max_price);
    }

    // Add sorting
    if (sort_by && sort_order) {
      const validSortColumns = ["price", "model_year", "name"]; // Add valid columns for sorting
      const validSortOrders = ["asc", "desc"];

      if (
        validSortColumns.includes(sort_by) &&
        validSortOrders.includes(sort_order)
      ) {
        query += ` ORDER BY ${sort_by} ${sort_order}`;
      }
    }

    // Execute the query
    const [vehicles] = await pool.execute(query, params);

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
  getAllPrduct,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getRelatedProducts,
  searchVehicles,
};