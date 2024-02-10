const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



Util.getClassifications = async function (classification_id=null) {
  let data = await invModel.getClassifications()
  let dropdown = "<select name='classification_id' id='classification_id' required>"
  dropdown += "<option value=''> --Select-- </option>"
  data.rows.forEach((row) => {
    dropdown += "<option value=" + row.classification_id;
    if (classification_id == row.classification_id) {
      dropdown += " selected";
    }
     dropdown += ">" + row.classification_name + "</option>"
  })
  dropdown += "</select>"
  return dropdown
}



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* ****************************************
 * Build the inventory item detail view HTML
 **************************************** */
Util.buildInventoryDetail = async function(data){
  let detail = '<div class="vehicle-detail">'
  detail += '<img src="' + data[0].inv_image + '" alt="Image of ' + data[0].inv_make + ' ' + data[0].inv_model + '">'
  detail += '<div class="vehicle-info">'
  detail += '<p>Year: ' + data[0].inv_year + '</p>'
  detail += '<p>Price: $' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</p>'
  detail += '<p>Mileage: ' + new Intl.NumberFormat('en-US').format(data[0].inv_miles) + '</p>'
  detail += '<p>Color: ' + data[0].inv_color + '</p>'
  detail += '<p>Description: ' + data[0].inv_description + '</p>'
  detail += '</div>'
  detail += '</div>'
  return detail
}

/* **************************************
* Build the login view HTML
* ************************************ */
Util.buildLogin = async function(req, res, next){
  let login
  login = '<form id="login">'
  login += '<label for="account_email">Email:</label><br>'
  login += '<input type="text" id="account_email" name="account_email"><br>'
  login += '<label for="account_password">Password:</label><br>'
  login += '<input type="password" id="account_password" name="account_password">'
  login += '<span id="pswdBtn">Show Password</span><br>'
  login += '<input type="submit" value="Log In">'
  login += '<p>No account? <a href="/account/register">Sign-up</a></p>'
  login += '</form>'
  return login
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("notice", "Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }
 
/* **************************************
* Build the account management view HTML
* ************************************ */

 Util.buildAccountMgnt = async function(req, res, next){
  let mgnt
  mgnt += '<h2>Welcome' + res.locals.accountData.account_firstname + '</h2>'
  mgnt += '<p><a class="management-link" href="account/update/' + res.locals.accountData.account_id +  '">Update Account Info</a></p>'
  if (res.locals.accountData.account_type == 'Employee' || res.locals.accountData.account_type == 'Admin') {
    mgnt += '<h2>Inventory Management</h2>'
    mgnt += '<p><a class="management-link" href="/inv/">Go to Inventory Management</a></p>'
  }
  return mgnt
}


/* **************************************
* Build the register view HTML
* ************************************ */
Util.buildRegister = async function(req, res, next){
  let register
  register = '<form id="register" action="/account/register" method="post">'
  register += '<label for="account_firstname">First Name:</label><br>'
  register += '<input type="text" id="account_firstname" name="account_firstname" required><br>'
  register += '<label for="account_lastname">Last Name:</label><br>'
  register += '<input type="text" id="account_lastname" name="account_lastname" required><br>'
  register += '<label for="account_email">Email:</label><br>'
  register += '<input type="email" id="account_email" name="account_email" required><br>'
  register += '<label for="account_password">Password:</label><br>'
  register += '<span>Passwords must be at least 12 characters and contain at least 1 number, 1 capital letter and 1 special character</span>'
  register += '<input type="password" id="account_password" name="account_password" required pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$">'
  register += '<span id="pswdBtn">Show Password</span><br>'
  register += '<input type="submit" value="Log In">'
  register += '</form>'
  return register
}

Util.buildClassificationList = async function (classification_id=null) {
  let data = await invModel.getClassifications()
  let dropdown = "<select name='classification_id' id='classification_id' required>"
  dropdown += "<option value=''> --Select-- </option>"
  data.rows.forEach((row) => {
    dropdown += "<option value=" + row.classification_id;
    if (classification_id == row.classification_id) {
      dropdown += "selected";
    }
     dropdown += ">" + row.classification_name + "</option>"
  })
  dropdown += "</select>"
  return dropdown
}

/* ****************************************
 *  Check account_type
 * ************************************ */
Util.CheckAccType = (req, res, next) => {

  if(res.locals.accountData.account_type == 'Admin' || res.locals.accountData.account_type == 'Employee') {
    next();
  } else {
    req.flash("notice", "Access Denied. Only authorized users can access that page");
    return res.redirect("/");
  }
};


module.exports = Util

