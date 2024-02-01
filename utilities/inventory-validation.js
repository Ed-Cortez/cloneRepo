const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/* **********************************
 * Inventory Data Validation Rules
 * ********************************* */
validate.invRules = () => {
  return [
    // vehicle make trim and min length
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle make."),

    // vehicle model trim and min length
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle model."),

    // vehicle year trim, 4 characters, is number
    body("inv_year")
      .trim()
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage("Please provide a valid 4-digit vehicle year."),

    // description exists
    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle description."),

    // price is trimmed, and converted to int
    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Please provide a valid vehicle price."),

    // miles is trimmed, 9 digits max, and converted to int
    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Please provide a valid vehicle mileage."),

    // color trimmed, is there
    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle color."),
  ];
};

/* ******************************
 * Check data and return errors or continue to vehicle registration
 * ***************************** */
validate.checkInvData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let dropdown = await utilities.getClassifications();
    res.render("inventory/addInventory", {
      errors,
      title: "Add New Vehicle to Inventory",
      dropdown,
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
    return;
  }
  next();
};

module.exports = validate;
