const express = require("express");
const adminRoutes = require("./routes/adminRoutes.js");
const brandRoutes = require("./routes/brandRoutes.js");
const productRoutes = require("./routes/vehiclesRoutes.js");
const staticRoutes = require("./routes/staticRoutes.js");

const rateLimit = require("express-rate-limit");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);
app.use(express.static("public"));
app.use("/assets", express.static(__dirname + "/views/assets"));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use("/", staticRoutes);
app.use("/api", adminRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product", productRoutes);

module.exports = app;