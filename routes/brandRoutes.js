const express = require("express");
const upload = require("../middlewares/multerConfig");
const {
  createBrand,
  getBrandRecord,
  getBrandRecordWithPagination,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");

const router = express.Router();

router.post("/add", upload.single("logo"), createBrand);
router.get("/getall", getBrandRecord);
router.get("/withpagination",getBrandRecordWithPagination);
router.get("/:id", getBrandById);
router.put("/update/:id", upload.single("logo"), updateBrand);
router.delete("/delete/:id", deleteBrand);
module.exports = router;