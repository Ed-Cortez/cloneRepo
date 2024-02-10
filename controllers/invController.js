const invModel = require("../models/inventory-model")
const utilities = require("../utilities/index")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getInventoryById(inventory_id)
  const detail = await utilities.buildInventoryDetail(data)
  let nav = await utilities.getNav()
  const vehicleName = data[0].inv_make + " " + data[0].inv_model
  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    detail,
    errors: null
  })
}




/* ***************************
 *  Build new classification view
 * ************************** */
invCont.buildNewClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/addClassification", {
    title: "Add a New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build new inventory view
 * ************************** */
invCont.buildNewInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let dropdown = await utilities.getClassifications()
  res.render("./inventory/addInventory", {
    title: "Add a New Vehicle to Inventory",
    nav,
    dropdown,
    errors: null,
  })
}

//error handling
invCont.throwError = async function(req, res, next) {
  try{
    throw new Error("this is my epic scary 500 error")
  }catch(error){
    next(error)
  }
}

/* ****************************************
*  Process new classification
* *************************************** */
invCont.newClassification = async function(req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const addClassResult = await invModel.insertNewClassification(classification_name)

  if (addClassResult) {
    nav = await utilities.getNav();
    req.flash(
      "notice",
      `Congratulations, you added ${classification_name} to the list of classifications.`
    )
    res.status(201).render("inventory/addClassification", {
      title: "Create New Classification",
      nav,
      errors: null,
    })
  } else {
    req.flash(
      "error",
      "Sorry, adding this Classification failed.")
      res.status(501).render("inventory/addClassification", {
        title: "Create New Classification",
        nav,
        errors: null,
      })
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.getClassifications()
  res.render("./inventory/management", {
    title: "Management",
    nav,
    classificationSelect,
    errors: null,
  })
}



/* ****************************************
*  Process new Inventory
* *************************************** */
invCont.newInventory = async function(req, res) {
  let nav = await utilities.getNav()
  let dropdown = await utilities.getClassifications()
  const { inv_make
    , inv_model
    , inv_year
    , inv_description
    , inv_image
    , inv_thumbnail
    , inv_price
    , inv_miles
    , inv_color
    , classification_id } = req.body

  //convert price and miles to int
  let inv_price_int, inv_miles_int
  try {
    inv_price_int = parseInt(inv_price)
    inv_miles_int = parseInt(inv_miles)
  } catch (error) {
    req.flash("notice", "sorry, there was an error processing vehicle.")
    res.status(500).render("inventory/addInventory", {
      title: "Add to Inventory",
      nav,
      dropdown,
      errors: null,
    })
  }
  //inserts data into inventory table
  const addInvResult = await invModel.insertNewVehicle(
      inv_make
    , inv_model
    , inv_year
    , inv_description
    , inv_image
    , inv_thumbnail
    , inv_price_int
    , inv_miles_int
    , inv_color
    , classification_id)

    //success
  if (addInvResult) {
    req.flash(
      "success",
      `Congratulations, you added ${inv_year} ${inv_make} ${inv_model} to the Inventory.`
    )
    res.status(201).render("inventory/addInventory", {
      title: "Add to Inventory",
      nav,
      dropdown,
      errors: null,

    })
    //failure
  } else { 
    req.flash(
      "notice",
      "Sorry, adding this vehicle failed.")
    res.status(501).render("inventory/addInventory", {
      title: "Add to Inventory",
      nav,
      dropdown,
      errors: null,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build delete inventory confirmation view
 * ************************** */
invCont.delInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price,
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
  } = req.body
  console.log(inv_id)
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    const itemName = inv_make + " " + inv_model
    req.flash("success", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    })
  }
}


/* ***************************

 *  Build edit inventory view

 * ************************** */

invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.getClassifications(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id
  })

}

/* ***************************
 *  Update Inventory Data
 * ************************** */

invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("success", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.getClassifications(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}




module.exports = invCont