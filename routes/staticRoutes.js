const express = require("express");
const router = express.Router();
const Brand = require("../models/Brand");
const Vehicle = require("../models/Vehicle");
const {
  isAuthenticated,
  authMiddleware,
} = require("../middlewares/authMiddleware");

router.get("/login", isAuthenticated, (req, res) => {
  res.render("login");
});

router.get("/profile", (req, res) => {
  res.render("profile");
});
//brand
router.get("/add-model/:id?", async (req, res) => {
  try {
    const brandId = req.params.id;
    let brand = null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (brandId) {
      brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).send("Brand not found");
      }
    }

    const result = await Brand.findAll(page, limit);

    res.render("addModel", {
      title: brand ? "Edit Brand" : "Add Brand",
      brand: brand,
      brands: result.data,
      pagination: {
        total: result.total,
        currentPage: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).send("Internal Server Error");
  }
});

//vehicle
router.get("/add-vehicle/:id?", async (req, res) => {
  try {
    const productId = req.params.id;
    let product = null;

    if (productId) {
      product = await Vehicle.findById(productId);
      if (!product) {
        return res.status(404).send("Vehicle not found");
      }
    }

    const brands = await Brand.findAllForBikes();
    res.render("addVehicle", {
      title: product ? "Edit Bike" : "Add Bike",
      product: product,
      brands: brands,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

  const result = await Vehicle.findAll(page,limit);
  res.render("index", {
    title: "Bike Record",
    vehicle: result.data,
    pagination: {
      total: result.total,
      currentPage: result.page,
      totalPages: result.totalPages,
      limit: result.limit,
    },
  });
});
router.get("/add-model", (req, res) => {
  res.render("addModel", { title: "Add Bike Model" });
});
router.get("/add-vehicle", (req, res) => {
  res.render("addVehicle", { title: "Add Vehicle" });
});

module.exports = router;