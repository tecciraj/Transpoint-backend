const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const busSchema = mongoose.Schema({
    route: {    
            type:Number,
            required:true
    },
    coordinates:[{
                latitude: {
                     type: Number
                },
                longitude: {
                     type: Number
                 }
    }]

    })
busSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the bus
    const bus = this
    const token = jwt.sign({_id: bus._id}, process.env.JWT_KEY)
    bus.tokens = bus.tokens.concat({token})
    await bus.save()
    return token
}
const bus = mongoose.model('BusRoute', busSchema)

module.exports = bus

