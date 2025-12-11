const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multerConfig");
const VehicleController = require("../controllers/vehicleController");

router.post("/add", upload.array("image", 5), VehicleController.createVehicle); 
router.get("/",VehicleController.getAllPrduct);
router.get("/:id",VehicleController.getVehicleById);
router.put("/update/:id",upload.array("image", 5),VehicleController.updateVehicle);
router.delete("/delete/:id",VehicleController.deleteVehicle);
router.get("/related/:id", VehicleController.getRelatedProducts);
router.get("/search", VehicleController.searchVehicles); 

module.exports = router;