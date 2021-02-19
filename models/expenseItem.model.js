const mongoose = require("mongoose")
const model = mongoose.model
const Schema = mongoose.Schema

const expenseSchema = new Schema (
    {
        budgetConcept: { type: Schema.Types.ObjectId, ref: 'BudgetItem' },
        expenseAmount: Number,

})

const ExpenseItem = model("ExpenseItem", expenseSchema);

module.exports = ExpenseItem