//1. IMPORTACIONES

const express = require("express");
const mongoose = require('mongoose');
const Users = require("../models/user.model.js")
// const BudgetItem = require("../models/budgetItem.model.js)

const uploadCloud = require("../configs/cloudinary.config.js")

const router = express.Router();
const bcrypt = require("bcrypt");
const IncomeItem = require("../models/incomeItem.model.js");
const BudgetItem = require("../models/budgetItem.model.js");
const ExpenseItem = require("../models/expenseItem.model.js");


const saltRounds = 10


// RUTAS

// GET Mostrar registro en ruta raíz

router.get("/",(req,res,next)=>{
    res.render("index")  
})

// GET Mostrar INICIAR SESION en ruta /ingresa

router.get("/ingresa",(req,res,next)=>{
    res.render("index")
})

// GET Mostrar FORMULARIO para crear cuenta

router.get("/registro",(req,res,next)=>{
    res.render("registro")
})

// POST Creación de cuenta

router.post("/registro",(req,res,next)=>{
    const {username, email, password} = req.body


    if (!username || !email || !password) {
        res.render('registro', { errorMessage: 'No te olvides de llenar los tres campos' });
        return;}

        //VALIDACIÓN de la estructura del password
        const regexPassword = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!regexPassword.test(password)) {
          res
            .status(500)
            .render('registro', { errorMessage: 'Tu contraseña debe tener al menos 6 caracteres, al menos un número, una letra mayúscula y una minúscula.' });
        }
        //VALIDACIÓN de la estructura del mail

        const regexEmail = /^\S+@\S+\.\S+$/;
        if (!regexEmail.test(email)) {
            res
            .status(500)
            .render('registro',{errorMessage: 'Proporciona una dirección de correo electrónico válida'})
        }

    bcrypt.genSalt(saltRounds)
    .then((salt)=>{
        bcrypt.hash(password,salt)
   .then((passwordHash)=>{
       
       return Users.create({
           username, 
           email, 
           passwordHash, 
           profilePictureUrl:"https://res.cloudinary.com/robtc/image/upload/v1613519785/preguntas..._3_ojhsyy.png",
           incomeItem:[],
           budgetItem:[],
        })
   })

    .then((newUser)=>{
        res.render("welcome")
    })
    //MANEJO DE ERRORES 
    .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(500).render('registro', { errorMessage: error.message });

        } else if (error.code === 11000) {
            res.status(500).render('registro', {
               errorMessage: 'El correo electrónico que proporcionaste ya está en uso'
            });
        } else {
            next(error);
        }
    })


    })
})

// POST iniciar sesión

router.post("/ingresa",(req,res,next)=>{

    console.log('SESSION =====> ', req.session);

    const {email, password} = req.body;
        
    if (!email || !password) {
        res.render('index',{
            errorMessage:"Los dos campos son requeridos"
        });
        return;
    }
    
    Users.findOne({email})
    .then(userFound => {
        if (!userFound) {
            res.render('index',{
                errorMessage: "El correo no está registrado."
            });
            return;
        } 
        else if (bcrypt.compareSync
            (password, userFound.passwordHash)
            ) {
            req.session.currentUser = userFound;
            
            res.redirect('/perfil');

        } else {
            res.render('index',{
                errorMessage:
                "Contraseña incorrecta"});
        }
    })
    .catch((error)=> next(error))

});


// POST para cerrar sesión

router.post('/cerrar',(req,res)=>{
    req.session.destroy;
    //console.log("sesión x destruir",req.session.destroy())
    res.redirect('/');
});

// GET editar perfil

router.get('/perfil/editar',(req,res)=>{
    res.render("editarperfil",{
        userInSession: req.session.currentUser
    })
})

// POST editar perfil

router.post('/perfil/editar',uploadCloud.single("fotoPerfil"),(req,res)=>{
    
    console.log(req.file)
    const urlImage = req.file.path 
    console.log("esto es el req.session",req.session.currentUser)
    const id =req.session.currentUser._id    

    Users.findByIdAndUpdate(id,{$set:{profilePictureUrl:urlImage}},{new:true})
    .then((userFound)=>{
        req.session.currentUser = userFound
        console.log(userFound)
        res.redirect("/perfil")
    }
    )
})

// RUTA para actualizar foto de perfil /editar/subirfoto
router.post('/perfil/:idUser/editar', uploadCloud.single("fotoPerfil"),(req,res,next)=>{
    const id = req.params.idUser

    const {name} = req.body
    console.log(req.file)
    const urlImage = req.file.path

    Users.findByIdAndUpdate
})

// RUTA para mostrar la vista crear ingreso

router.get('/crearingreso',(req,res,next)=>{

    res.render("crearingreso",{
    userInSession: req.session.currentUser
    })
})


// POST para crear un nuevo ingreso

router.post ('/crearingreso',(req,res,next)=>{

    const {incomeOwner, incomeAmount, incomeSource, incomeDate} = req.body

    IncomeItem.create({incomeOwner: req.session.currentUser._id, incomeAmount, incomeSource, incomeDate})
    .then((itemCreated)=>{
        //console.log("el item created es",itemCreated)

        return Users.findByIdAndUpdate(req.session.currentUser._id,{$push:{incomeItem: itemCreated._id}})
    })
    .then(()=>{
        res.redirect('/ingresos')
    })
    
    .catch((error)=>{
        console.log(`Err while creating the income in DB:${error}`)
        next(error)
    })
})

// GET para mostrar la vista ingresos

router.get('/ingresos',(req,res,next)=>{

    IncomeItem.find()
        .populate('incomeOwner')

    .then(()=>{
        //console.log('items Found',itemsFound)
    
    IncomeItem.find({incomeOwner:req.session.currentUser._id})
    .then((incomeFound)=>{
        console.log("esto mando a ingresos", {incomeFound})

        res.render("perfil",{incomeFound: incomeFound,
        userInSession:req.session.currentUser})
    })
    .catch((error)=>{
        console.log(`Error while getting the incomeItem from the DB:${error}`)
        next(error)
    })

    })
})

// RUTA para mostrar la vista crear presupuesto

router.get('/crearpresupuesto',(req,res,next)=>{

    res.render("crearpresupuesto",{
    userInSession: req.session.currentUser
    })
})

// POST para crear una nueva partida presupuestal

router.post("/crearpresupuesto",(req,res,next)=>{

    const {budgetOwner,budgetConcept, budgetAmount} = req.body

    BudgetItem.create({budgetOwner: req.session.currentUser._id,budgetConcept, budgetAmount})

    .then((budgetCreated)=>{

        return Users.findByIdAndUpdate(req.session.currentUser._id,{$push:{budgetItem: budgetCreated._id}})

    })
    
    .then(()=>{
        res.redirect("/presupuesto")
    })
    .catch((error)=>{
        console.log(`Err while creating the budget in DB:${error}`)
        next(error)
    })

})

// GET para mostrar la vista presupuesto

router.get("/presupuesto",(req,res,next)=>{
    BudgetItem.find()
        .populate('budgetOwner')
    
    .then(()=>{

    BudgetItem.find({budgetOwner:req.session.currentUser._id})

    .then((budgetFound)=>{
        console.log("esto mando a presupuesto",{budgetFound:budgetFound})

        res.render("perfil",{budgetFound: budgetFound,
        userInSession:req.session.currentUser})
    })
    .catch((error)=>{
        console.log(`Error while getting the budgetItem from the DB: ${error}`)
        next(error)
    })
})
})

//GET Mostrar la vista "editaringreso"

router.get("/ingresos/:idIncome/editaringreso",(req,res,next)=>{

    const id = req.params.idIncome

    IncomeItem.findById(id)
    .then((incomeFound)=>{
        console.log("esto mando a edit:",{incomeFound:incomeFound,
            currentUser: req.session.currentUser})

        res.render("editarIngreso",{incomeFound:incomeFound,
        currentUser: req.session.currentUser})
    })
    })


//POST Guardar los cambios hechos en la vista "editarIngreso"

router.post("/ingresos/:incomeId/editaringreso",(req,res,next)=>{
    const id = req.params.incomeId

    const {incomeAmount, incomeSource, incomeDate} = req.body

    IncomeItem.findByIdAndUpdate(id,{incomeAmount, incomeSource, incomeDate},{new:true})
    .then(()=>{
        console.log("edicion de incomeItem concluida")
        res.redirect("/ingresos")
    })
    .catch((error)=>{
        console.log("Error when trying to edit income:",error)
        next(error)
    })

})

// POST. Borrar incomeItem

router.post("/ingresos/:itemId/eliminaringreso",(req,res,next)=>{

    const id = req.params.itemId

    IncomeItem.findByIdAndDelete(id)
    .then(()=>{
        res.redirect("/ingresos")
    }).catch((error)=>{
        console.log("Err trying to delete the incomeItem:",error)
        next(error)
    })
})

//GET Mostrar la vista "editar presupuesto"

router.get("/presupuesto/:idBudget/editarpresupuesto",(req,res,next)=>{

    const id = req.params.idBudget

    BudgetItem.findById(id)
    .then((budgetFound)=>{
        res.render("editarPresupuesto",{budgetFound:budgetFound,
        currentUser:req.session.currentUser})
    })
})


//POST. Guardar cambios hechos en los presupuestos

router.post("/presupuesto/:budgetId/editarpresupuesto",(req,res,next)=>{

    const id = req.params.budgetId

    const {budgetConcept, budgetAmount} = req.body

    BudgetItem.findByIdAndUpdate(id,{budgetConcept, budgetAmount},{new:true})

    .then(()=>{
        console.log("Edición de budgetItem exitoso")
        res.redirect("/presupuesto")

    })
    .catch((error)=>{
        console.log("Error trying to edit budgetItem",error)
        next(error)
    })

})

// POST. Borrar budgetItem

router.post("/presupuesto/:budgetId/eliminarpresupuesto",(req,res,next)=>{
    const id = req.params.budgetId

    BudgetItem.findByIdAndDelete(id)
    .then(()=>{
        res.redirect("/presupuesto")
    })
    .catch((error)=>{
        console.log("Err trying to delete the budgetItem:",error)
        next(error)
    })
})



//GET.  Crear ruta para la vista "reportar gasto"

router.get('/reportargasto', (req, res,next) => {
    BudgetItem.find()
      .then(budgetFound => {
          console.log("lo enviado es:",{ 
            budgetFound         })
        res.render('reportarGasto', { 
            budgetFound,
        currentUser:req.session.currentUser});
      })
      .catch(error => console.log(`Err while displaying expenseReport view: ${error}`));
  });

// POST. Reportar un gasto

router.post("/reportargasto",(req,res,next)=>{

    const {expenseAmount, budgetConcept} = req.body

    ExpenseItem.create({expenseAmount, budgetConcept})
    
    .then((expenseCreated)=>{
        console.log("el expense created es",expenseCreated)

        return BudgetItem.findByIdAndUpdate(budgetConcept,{$push:{expenseAmount:expenseCreated._id}})

    })
    .then(()=>{
        res.redirect("/gastos")
    })
    .catch((error)=>{
        console.log("Err when trying to create the expense report in DB:",error)
    })

})

//GET. Crear la vista de los gastos

router.get("/gastos",(req,res,next)=>{

    // ExpenseItem.find()
    //     .then((itemsFound)=>{
    //         // console.log("los items antes del populate",itemsFound)
    //     })
         ExpenseItem.find().populate("budgetConcept")

        .then((populated)=>{
            console.log("los populated son" ,populated)
        
            // res.render("perfil",{budgetFound: budgetFound,
            //     userInSession:req.session.currentUser})
            // })

             res.render("perfil",{expenseFound:populated,
             userInSession:req.session.currentUser})
        })
        .catch((error)=>{
            console.log("Err when trying to populate:",error)
            next(error)
        })
    })


// GET para mostrar vista de la ruta /perfil

router.get('/perfil',(req,res)=>{

   
    res.render('perfil',{
        userInSession: req.session.currentUser},)
})




module.exports = router