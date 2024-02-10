// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/index")
const regValidate = require('../utilities/account-validation')

router.get("/update/:account_id", utilities.handleErrors(accountController.buildUpdate))


router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister));


// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);


// Process account update
router.post(
  "/update",
  regValidate.updateUserRules(),
  regValidate.checkAccountData,
  utilities.handleErrors(accountController.accountUpdate)
)

router.post(
  "/updatePass",
  regValidate.updateAccountPasswordRules(),
  regValidate.checkPassword,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router; 