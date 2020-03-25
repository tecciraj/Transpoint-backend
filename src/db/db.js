const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://AuthAdmin:AuthAdmin3128@authcluster-de2v8.mongodb.net/user-registration-db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
})