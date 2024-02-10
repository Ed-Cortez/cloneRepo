// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")
const classValidate = require("../utilities/classification-validation")
const invValidate = require("../utilities/inventory-validation")


// Route to management page
router.get("/", utilities.CheckAccType, utilities.handleErrors(invController.buildManagement));

//build the edit Inventory View
router.get("/edit/:inventory_id", utilities.CheckAccType, utilities.handleErrors(invController.editInventoryView));

//route to get inventory as json objects
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to deliver a specific inventory item detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Route to add Classification
router.get("/addClass", utilities.CheckAccType,  utilities.handleErrors(invController.buildNewClassification));

// Route to add Inventory 
router.get("/addVehicle", utilities.CheckAccType, utilities.handleErrors(invController.buildNewInventory));

// Route to the Management 
router.get("/management", utilities.CheckAccType, utilities.handleErrors(invController.buildManagement))

//build the delete inventory view
router.get("/delete/:inventory_id",  utilities.CheckAccType, utilities.handleErrors(invController.delInventoryView))


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

//Process Delete Inventory 
router.post(
  "/delete/",
  utilities.handleErrors(invController.deleteInventory)
)

//Process update Inventory 
router.post(
  "/update/", 
  invValidate.invRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)


module.exports = router; 