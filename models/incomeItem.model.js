const mongoose = require("mongoose")
const model = mongoose.model
const Schema = mongoose.Schema

const incomeSchema = new Schema (
    {
        incomeOwner: { type: Schema.Types.ObjectId, ref: 'Users' },
        incomeAmount: Number,
        incomeSource: String,
        incomeDate: Date
})

const IncomeItem = model("IncomeItem", incomeSchema);

module.exports = IncomeItem