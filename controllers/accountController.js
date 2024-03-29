const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/index.js")
const accountModel = require("../models/account-model.js")
const bcrypt = require('bcrypt');


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  let login = await utilities.buildLogin()
  res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
  })
}
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  let register = await utilities.buildRegister()
  res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
  })
}


/* ***************************
 *  Build inventory management view
 * ************************** */
async function buildAccount (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}


  /* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname,
          account_lastname,
          account_email,
          account_password 
      } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      // login,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      // register,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  try {
    // Obtener la navegación
    let nav = await utilities.getNav();
    // Obtener los datos del cuerpo de la solicitud
    const { account_email, account_password } = req.body;
    // Buscar la cuenta por correo electrónico en la base de datos
    const accountData = await accountModel.getAccountByEmail(account_email);
    
    // Verificar si no se encontraron datos de cuenta
    if (!accountData) {
      // Mostrar un mensaje de error y volver a renderizar la página de inicio de sesión
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
    
    // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    
    // Verificar si las contraseñas coinciden
    if (passwordMatch) {
      // Eliminar la contraseña de los datos de la cuenta antes de generar el token JWT
      delete accountData.account_password;
      // Generar el token JWT y establecerlo en una cookie
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      // Redireccionar al usuario a la página de la cuenta
      return res.redirect("/account/");
    } else {
      // Mostrar un mensaje de error si las contraseñas no coinciden y volver a renderizar la página de inicio de sesión
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    // Manejar cualquier error que ocurra durante el inicio de sesión
    console.error("Error during login:", error);
    req.flash("error", "There was an error processing your request. Please try again later.");
    // Redireccionar al usuario a una página de error general
    return res.redirect("/error");
  }
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  res.render("./account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id,
  })
}

   /* ****************************************
 *  Process update request
 * ************************************ */
   async function accountUpdate(req, res) {
    let nav = utilities.getNav();
    const {
        account_firstname,
        account_lastname,
        account_email,
        account_id
    } = req.body;
  
    const updateResult = await accountModel.updateAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    );
  
    const accountData = await accountModel.getAccountById(account_id);
    console.log(accountData);
  
    if (updateResult) {
        try {
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: 3600 * 1000
            });
            res.cookie("jwt", accessToken, {
                httpOnly: true,
                maxAge: 3600 * 1000
            });
            return req.flash("success semi-bold", "The account was updated."), res.redirect("/account/");
        } catch (error) {
          return new Error('Access Forbidden')
         }

    } else {
        req.flash("notice", "Sorry, the update failed.");
        return res.status(501).render(`./account/update`, {
            title: "Edit Account Information",
            nav,
            errors: null,
            account_id: account_id,
            account_firstname: account_firstname,
            account_lastname: account_lastname,
            account_email: account_email,
        });
    }
}

  
  async function updatePassword(req, res) {
    let nav = await utilities.getNav()
    const { account_id, account_password, account_firstname, account_lastname, account_email} = req.body
    // Hash before storing
    let hashedPassword = await bcrypt.hashSync(account_password, 10)
    const accountPassword = await accountModel.updatePassword(hashedPassword, account_id)
    const accountData = await accountModel.getAccountById(account_id)
    if(accountPassword){
      try{
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        return req.flash("success", "The account password was updated. Hope you didn't forget it."), res.redirect("/account/")
        } catch (error) {
        return new Error('Access Forbidden')
      }
      } else {
        req.flash("notice", "Sorry, the change of password failed.")
        res.status(501).render(`./account/update`, {
          title: "Edit Account Information",
          nav,
          errors: null,
          account_id: account_id,
          account_firstname: account_firstname,
          account_lastname: account_lastname,
          account_email: account_email,
        })
      }
  }


  // Obtener todas las cuentas de usuario
async function getAllAccounts(req, res) {
  try {
    const accounts = await accountModel.getAccounts();
    res.status(200).json(accounts); // Enviar la lista de cuentas como respuesta JSON
  } catch (error) {
    console.error("Error al obtener todas las cuentas:", error);
    res.status(500).json({ error: "Hubo un error al procesar la solicitud." });
  }
}


async function viewAllAccounts(req, res) {
  try {
    // Obtener el identificador único del usuario actual desde el token JWT almacenado en la cookie
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const currentUserEmail = decodedToken.account_email;

    // Obtener todas las cuentas de usuario
    const accounts = await accountModel.getAccounts();

    // Filtrar la lista de cuentas para excluir al usuario actual
    const filteredAccounts = accounts.filter(account => account.account_email !== currentUserEmail);

    // Obtener la navegación
    const nav = await utilities.getNav();

    // Renderizar la vista con la lista filtrada de cuentas
    res.render("account/accounts", {
      title: "All Accounts",
      accounts: filteredAccounts,
      nav: nav
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    req.flash("error", "There was an error fetching accounts.");
    res.redirect("/"); // Redireccionar a la página principal si ocurre un error
  }
}



async function updateAccountType(req, res) {
  const { account_id, account_type } = req.body;
  try {
    // Lógica para actualizar el account_type en la base de datos
    // Ejemplo:
    await accountModel.updateAccountType(account_id, account_type);
    req.flash("success", "Account type updated successfully.");
    res.redirect("/account/all");
  } catch (error) {
    console.error("Error updating account type:", error);
    req.flash("error", "There was an error updating account type.");
    res.redirect("/account/all");
  }
}

  module.exports = { 
    buildLogin, 
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccount,
    buildUpdate,
    accountUpdate,
    updatePassword,
    getAllAccounts,
    viewAllAccounts,
    updateAccountType
}