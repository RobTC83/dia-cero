const mongoose = require("mongoose")
const model = mongoose.model
const Schema = mongoose.Schema

const UserSchema = new Schema ({
        email: {
            type: String,
            required: [true, 'Para crear tu cuenta introduce tu dirección de correo electrónico'],
            match: [/^\S+@\S+\.\S+$/, 'Proporciona una dirección de correo electrónico válida'],
            unique: true,
            lowercase: true,
            trim: true
        },
    
        passwordHash:{
            type: String,
            required: [true,"Introduce tu contraseña"]
        }
    },
    {
        timestamps:true
    }
    );

    const Users = model("Users",UserSchema);
    
    module.exports = Users;