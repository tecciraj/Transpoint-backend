const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const driverSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    route:{
        type: Number,
        required: true,
        unique:true,
    },
    phoneno:{
        type: Number,
        minLength: 10,
        required: true,
        unique:true

    },
    pin:{
        type:Number,
        minLength: 4
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})
driverSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the driver
    const driver = this
    const token = jwt.sign({_id: driver._id}, process.env.JWT_KEY)
    driver.tokens = driver.tokens.concat({token})
    await driver.save()
    return token
}

driverSchema.statics.findByCredentials = async (phoneno, pin) => {
    // Search for a driver by phone no and pin.
    const driver = await Driver.findOne({ phoneno} )
    //const rand = getRandomInt(9999)
    if (!driver) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPinMatch = await (pin== driver.pin)
    if (!isPinMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return driver
}
const Driver = mongoose.model('Driver', driverSchema)

module.exports = Driver

