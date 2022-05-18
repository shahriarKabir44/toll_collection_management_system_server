const mongoose = require('mongoose')
const cors = require('cors')
const express = require('express')

mongoose.connect("mongodb+srv://mongo_admin:very_secret_password@cluster0.3sx7v.mongodb.net/toll_collection?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true })

const cluster = require('cluster');
const Payment = require('./models/payment');
const totalCPUs = require('os').cpus().length;
if (cluster.isMaster) {
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

}
else {
    startExpress();
}

function startExpress() {
    let app = express()
    app.use(cors())
    app.use(express.json())
    app.listen(process.env.PORT || 3000)
    app.get('/pay/:vehicleId/:bridge', async (req, res) => {
        console.log("here")
        const { vehicleId, bridge } = req.params
        const newPayment = new Payment({
            bridge: bridge,
            vehicleId: vehicleId,
            isPaid: 1,
            time: (new Date()) * 1
        })
        await newPayment.save()
        res.send({ data: 1 })
    })
    app.get('/checkPayment/:vehicleId/:bridge', async (req, res) => {
        const { vehicleId, bridge } = req.params
        const payment = await Payment.find({
            $and: [
                { bridge: bridge },
                { vehicleId: vehicleId }
            ]
        }).sort({ time: -1 })
        if (!payment.length || !payment[0].isPaid) {
            console.log({ data: 0 })
            res.send({ data: 0 })
        }
        else {
            console.log(payment[0])
            Payment.findOneAndUpdate({
                $and: [
                    { bridge: bridge },
                    { vehicleId: vehicleId },
                    { time: payment[0].time }
                ]
            }, { $set: { isPaid: 0 } })
                .then(data => {
                    console.log({ data: 1 })
                    res.send({ data: 1 })
                })
        }
    })

}