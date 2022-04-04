var mongoose = require('mongoose')

var paymentSchema = new mongoose.Schema({

    bridge: { type: String },
    vehicleId: { type: String },
    isPaid: { type: Number },
    time: { type: Number }

})

const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment