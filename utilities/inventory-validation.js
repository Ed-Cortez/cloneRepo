const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

validate.invRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle make."),

    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle model."),

    body("inv_year")
      .trim()
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage("Please provide a valid 4-digit vehicle year."),

    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle description."),

    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Please provide a valid vehicle price."),

    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Please provide a valid vehicle mileage."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle color."),
  ];
};


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
