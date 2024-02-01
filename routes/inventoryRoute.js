// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")
const invValidate = require("../utilities/inventory-validation")
const classValidate = require("../utilities/classification-validation")


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to deliver a specific inventory item detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Route to add Classification
router.get("/addClass",  utilities.handleErrors(invController.buildNewClassification));

// Route to add Inventory 
router.get("/addVehicle",  utilities.handleErrors(invController.buildNewInventory));

// Route to the Management 
router.get("/management", utilities.handleErrors(invController.buildManagement))


// Process new classification data
router.post(
    "/addClass",
    classValidate.classRules(),
    classValidate.checkClassificationData,
    utilities.handleErrors(invController.newClassification)
  ) 


// Process new Inventory data
router.post(
  "/addVehicle",
  invValidate.invRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.newInventory)
)

module.exports = router; 