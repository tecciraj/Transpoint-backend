const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const routeSchema = mongoose.Schema({
    route: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    time : { type : Date, default: Date.now }
    })
routeSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the bus
    const bus = this
    const token = jwt.sign({_id: bus._id}, process.env.JWT_KEY)
    bus.tokens = bus.tokens.concat({token})
    await bus.save()
    return token
}

/*routeSchema.statics.find = async (route) => {
    // Search for a route.
    const bus = await Route.findOne({ route} )
    if (!bus) {
        throw new Error({ error: 'Invalid bus route' })
    }
    return bus
}*/
const bus = mongoose.model('Route', routeSchema)

module.exports = bus

