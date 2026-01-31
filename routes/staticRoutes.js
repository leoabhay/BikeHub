const express = require("express");
const router = express.Router();
const Brand = require("../models/Brand");
const Vehicle = require("../models/Vehicle");
const Admin = require("../models/Admin");
const {
  isAuthenticated,
  authMiddleware,
} = require("../middlewares/authMiddleware");

router.get("/login", isAuthenticated, (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.redirect("/login");
    }
    const [totalBikes, totalBrands] = await Promise.all([
      Vehicle.countDocuments({}),
      Brand.countDocuments({})
    ]);

    res.render("profile", {
      admin: admin,
      totalBikes: totalBikes,
      totalBrands: totalBrands,
      title: "BikeHub | Profile"
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).send("Internal Server Error");
  }
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
      title: brand ? "BikeHub | Edit Brand" : "BikeHub | Add Brand",
      brand: brand,
      brands: result.data,
      pagination: {
        total: result.total,
        totalItems: result.total,
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
      title: product ? "BikeHub | Edit Bike" : "BikeHub | Add Bike",
      product: product,
      brands: brands,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [result, stats] = await Promise.all([
      Vehicle.findAll(page, limit),
      Vehicle.getStats()
    ]);

    res.render("index", {
      title: "BikeHub | Dashboard",
      vehicle: result.data,
      stats: stats,
      pagination: {
        total: result.total,
        totalItems: result.total, // Added for compatibility with index.ejs
        currentPage: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
      },
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;