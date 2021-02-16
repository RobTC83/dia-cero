//1. IMPORTACIONES

const express = require("express");
const mongoose = require('mongoose');
const Users = require("../models/user.model.js")
const router = express.Router();
const bcrypt = require("bcrypt")
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
    const {email, password} = req.body


    if (!email || !password) {
        res.render('registro', { errorMessage: 'No te olvides de llenar ambos campos' });
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
       
       return Users.create({email, passwordHash})
   })

    .then((newUser)=>{
        console.log('Nuevo registro',newUser)
        res.redirect("/perfil")
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
console.log(req.body)

    if (email==="" || password==="") {
        res.render('index',{
            errorMessage:"Ingresa un correo electrónico y una contraseña"
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
            res.render('ingresa',{
                errorMessage:
                "Contraseña inválida"});
        }
    })
    .catch((error)=> next(error))

});

// GET para mostrar vista de la ruta /perfil

router.get('/perfil',(req,res)=>{
    res.render('perfil')
})


module.exports = router