const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    regno: {
        type: Number,
        required: true,
        unique: true,
    },
    route:{
        type: Number,
        required: true

    },
    phoneno:{
        type: Number,
        minLength: 10,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

/*var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'krishna.srja@gmail.com',
      pass: ''
    }
  });
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        throw new Error({ error: 'Error has occured' })
    }
  });*/
userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})
/*function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }*/
userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email} )
    //const rand = getRandomInt(9999)
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}
const User = mongoose.model('User', userSchema)

module.exports = User

