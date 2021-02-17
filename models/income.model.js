const mongoose = require("mongoose")
const model = mongoose.model
const Schema = mongoose.Schema

const incomeSchema = new Schema (
    {
        amount: Number,
        incomeSource: String,
        date: Date,
        //belongs To, ¿a quién pertenece? ¿a qué ID de usuario pertenece?
})

const Income = model("Income", incomeSchema);

module.exports = Income