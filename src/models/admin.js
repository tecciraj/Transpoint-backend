const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const adminSchema = mongoose.Schema({
    userid: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})
adminSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the admin
    const admin = this
    const token = jwt.sign({_id: admin._id}, process.env.JWT_KEY)
    admin.tokens = admin.tokens.concat({token})
    await admin.save()
    return token
}
adminSchema.statics.findByCredentials = async (userid,password) => {
    // Search for a admin by userid and passeord...
    const admin = await Admin.findOne({ userid} )
    if (!admin) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPassMatch = await (password== admin.password)
    if (!isPassMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return admin
}
const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin

