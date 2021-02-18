const mongoose = require("mongoose")
const model = mongoose.model
const Schema = mongoose.Schema

const budgetSchema = new Schema (
    {
        budgetOwner: { type: Schema.Types.ObjectId, ref: 'Users' },
        budgetConcept: String,
        budgetAmount: Number,
})

const BudgetItem = model("BudgetItem", budgetSchema);

module.exports = BudgetItem