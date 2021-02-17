//1. IMPORTACIONES

const express = require("express");
const mongoose = require('mongoose');
const Users = require("../models/user.model.js")
// const Budget = require("../models/budget.model.js)

const uploadCloud = require("../configs/cloudinary.config.js")

const router = express.Router();
const bcrypt = require("bcrypt");
const Income = require("../models/income.model.js");
const Budget = require("../models/budget.model.js");
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
       
       return Users.create({username, email, passwordHash, profilePictureUrl:"https://res.cloudinary.com/robtc/image/upload/v1613519785/preguntas..._3_ojhsyy.png"})
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

// GET para mostrar vista de la ruta /perfil

router.get('/perfil',(req,res)=>{

    //const income = Income.find()
    //.then((incomeFound)=>{
        const id = req.session.currentUser._id
        Users.findById(id)
        .then((userFound)=>{
//console.log("lo que envío a perfil es:",{incomeFound: incomeFound})
        res.render('perfil',{userInSession: userFound},/*{incomeFound: incomeFound}*/)
    })

    
    })
//});

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
    // const profilePicture = URLSearchParams.create({profilePictureUrl})
})

// RUTA para mostrar la vista crear ingreso

router.get('/crearingreso',(req,res,next)=>{

    res.render("crearingreso",{
    userInSession: req.session.currentUser
    })
})


// POST para crear un nuevo ingreso

router.post ('/crearingreso',(req,res,next)=>{

    const {amount, incomeSource, date} = req.body

    Income.create({amount, incomeSource, date})
    .then(()=>{
        res.redirect("/ingresos")
    }).catch((error)=>{
        next(error)
    })
})

// GET para mostrar la vista ingresos

router.get('/ingresos',(req,res,next)=>{
    Income.find()
    .then((incomeFound)=>{
        console.log("esto mando a ingresos", {incomeFound})

        res.render("ingresos",{incomeFound: incomeFound,
        userInSession:req.session.currentUser})
    })
    .catch((error)=>{
        next(error)
    })
})

// RUTA para mostrar la vista crear presupuesto

router.get('/crearpresupuesto',(req,res,next)=>{

    res.render("crearpresupuesto",{
    userInSession: req.session.currentUser
    })
})

// POST para crear una nueva partida

router.post("/crearpresupuesto",(req,res,next)=>{

    const {concept, quantity} = req.body

    Budget.create({concept, quantity})

    .then(()=>{
        res.redirect("/presupuesto")
    })
    .catch((error)=>{
        next(error)
    })

})

// GET para mostrar la vista presupuesto

router.get("/presupuesto",(req,res,next)=>{


    Budget.find()
    .then((budgetFound)=>{
        console.log("esto mando a presupuesto",{budgetFound:budgetFound})

        res.render("presupuesto",{budgetFound: budgetFound})
    })
    .catch((error)=>{
        next(error)
    })
})


module.exports = router