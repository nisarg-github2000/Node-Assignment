var express = require("express");
var config = require('../../config');
var router = express.Router({
  caseSensitive: true,
});
var ensureToken = require('../../utilities/ensure-token.js');
const multer = require('multer'); 
const storageLocation = config.storagePath;

let storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, storageLocation); 
    }, 
    filename: (req, file, cb) => { 
        //console.log(file); 
        var filetype = ''; 
        if(file.mimetype === 'image/gif') { 
            filetype = 'gif'; 
        } 
        if(file.mimetype === 'image/png') { 
            filetype = 'png'; 
        } 
        if(file.mimetype === 'image/jpeg') { 
            filetype = 'jpg'; 
        } 
        cb(null, 'image-' + Date.now() + '.' + filetype); 
    } 
}); 
const upload = multer({ storage: storage });

/**
 *  Get All Cars
 */
var getAllCarsCtrl = require('../controllers/car-management/get-all-cars.js');
router.get("/all", ensureToken, function (req, res) {
  return getAllCarsCtrl.getAllCars(req, res);
});

/**
 *  Get Car By Id
 */
var getCarByIdCtrl = require("../controllers/car-management/get-car-by-id.js");
router.get("/:id", ensureToken, function (req, res) {
  return getCarByIdCtrl.getCarById(req, res);
});

/**
 *  Create Car
 */
var createCarCtrl = require("../controllers/car-management/create-car");
router.post("/create", ensureToken, function (req, res) {
  return createCarCtrl.createCar(req, res);
});

/**
 *  Update Car
 */
var updateCarCtrl = require("../controllers/car-management/update-car");
router.put("/update/:id", ensureToken, function (req, res) {
  return updateCarCtrl.updateCar(req, res);
});

/**
 *  Delete Car
 */
var deleteCarCtrl = require("../controllers/car-management/delete-car");
router.delete("/delete/:id", ensureToken, function (req, res) {
  return deleteCarCtrl.deleteCar(req, res);
});

/**
 *  Add Car Image
 */
var addCarImageCtrl = require("../controllers/car-management/add-car-image");
router.post("/upload/:id", [ensureToken, upload.single('carImage')], function (req, res) {
  return addCarImageCtrl.addCarImage(req, res);
});

module.exports = router;