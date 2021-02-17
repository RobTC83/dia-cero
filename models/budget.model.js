const mongoose = require("mongoose")
const model = mongoose.model
const Schema = mongoose.Schema

const budgetSchema = new Schema (
    {
        concept: String,
        quantity: Number,
})

const Budget = model("Budget", budgetSchema);

module.exports = Budget