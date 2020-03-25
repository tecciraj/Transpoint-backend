const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const Route = require('../models/Route')
const Bus=require('../models/BusRoute')
const Admin=require('../models/admin')
const Driver=require('../models/Driver')
const nodemailer = require("nodemailer");
const router = express.Router()
router.post('/users', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.send({ "flag":"1",user, token })
    } catch (error) {
        res.send({"flag":"0",error})
    }
})

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.send({"falg":"0",error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({"flag":"1", user, token })
    } catch (error) {
        res.send({"flag":"0",error:'login failed!!'})
    }

})
router.post('/users/update', async(req, res) => {
    const { email, password, name,route,phoneno } = req.body
    var filter={ email: email }
    var update={ password:password, name:name, route:route, phoneno:phoneno}
    var doc = await User.findOneAndUpdate(filter, update, {
    new: true
  })
  if(!doc){
    res.send({"flag":"0",error:'update failed!!'})
  }
  res.send(doc)

})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }



router.post('/users/forgotpassword',  function(req, res) {
    // user forgot password
    const {email}=req.body
    const rand = getRandomInt(9999)
    if(rand/1000==0){
        rand = getRandomInt(9999)
    }
    /*const send = require('gmail-send')({
        user: 'agnitranns@gmail.com',
        pass: 'Agnitranns@123',
        to:   email,
        subject: 'transPoint Forgot Password',
        
      })
      send({
        text: 'Your otp is '+rand,  
      }, (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
      })*/
      var transport = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:'465',
        auth: {
          user: "agnitranns@gmail.com",
          pass: "Agnitranns@123"
        }
      });  
      const message = {
        from: 'agnitranns@gmail.com', 
        to: email,       
        subject: 'transPoint Forgot Password', 
        text: "Dear user,\n \n"+         
        "We received a request to reset the password for transPoint\n \n"+
            "Your OTP is " +rand+ " ."+
        "Use this OTP to generate a new password.\n \n"+
        
        "This OTP is valid for 5 minutes.\n"+
        
        "Please do not share this one time password with anyone."
    };
    transport.sendMail(message, function(err, info) {
        if (err) {
          res.send({"flag":"0",err})
        } else {
        res.send({'otp':rand})
        }
    })
})
//var ad=new Admin({"userid":"adminact","password":"act@123"})
//ad.save()
router.post('/admin/login', async(req, res) => {
    //Login a registered admin
    try {
        const { userid, password } = req.body
        const admin = await Admin.findByCredentials(userid, password)
        if (!admin) {
            return res.send({"flag":"0",error: 'Login failed! Check authentication credentials'})
        }
        const token = await admin.generateAuthToken()
        res.send({"flag":"1",admin, token })
    } catch (error) {
        res.send({"flag":"0",error:'login failed!!'})
    }
})

/*router.post('/users/busroute', async(req, res) => {
    //get bus entire route 
    try {
        const  {route}= req.body
        //res.send("msg"+route)
        const busroute = await Route.find()
        //res.send("msg"+busroute)
        if (!busroute) {
            return res.status(401).send({error: 'Bus route not available'})
        }
        //res.send( "msd"+busroute)
    } catch (error) {
        res.status(400).send(error)
    }

})*/
var lat=12.955007
var long=80.242804
var i=0

let getQueueLength = function() {
    lat=lat+0.001
    long=long+0.001
    i=i+1
    return new Route({"route":12,"latitude":lat.toFixed(6),"longitude":long.toFixed(6)})
};
setInterval(function latLong() {
    var queueLength = getQueueLength();
    if (queueLength.latitude < 12.969007) {
        queueLength.save()
        console.log('This',{queueLength});
    }
}, 3000);
router.post('/routes', async (req, res) => {
    // enter bus lat long
    try {
        const route = new Route(req.body)
        //res.send({"re":route})
         await route.save()
        //const token = await route.generateAuthToken()
        res.send({"flag":"1",success:'Data entered'})
        //res.status(201).send({ route, token })
    } catch (error) {
        res.status(400).send({"flag":"0",error:'data not entered'})
    }
})
router.get('/routes/fetch', function (req, res) {
    const bus = Route.find({}, function(err, bus){
        if(err){
            res.send({"flag":"0",err})
        }
        else {
            res.send({"flag":"1",bus});
        }
    }).sort({'time':-1}).limit(2)
})

router.post('/bus/enter', async (req, res) => {
    // enter busRoute lat long
    try {
        const route = new Bus(req.body)
        await route.save()
        //const token = await route.generateAuthToken()
        res.send({"flag":"1",success:'Data entered'})
        //res.status(201).send({ route, token })
    } catch (error) {
        res.send({"flag":"0",error:'data not entered'})
    }
})
router.post('/bus/fetch', function (req, res) {
    const {route}=req.body
    //res.send({route})
    const bus = Bus.find({route:route}, function(err, bus){
        
        if(err){
            res.send({"flag":"0",err:'failure!!!'})
        }
        else {
            res.send({"flag":"1",bus});
        }
    })
})
/*router.post('/routes/fetch', async(req, res) => {
    //fetch bus route
    try {
        const { route } = req.body
        const bus = await Route.find(route)
        if (!bus) {
            return res.status(401).send({error: 'bus not found!!!'})
        }
        const token = await bus.generateAuthToken()
        res.send({ bus, token })
    } catch (error) {
        res.status(400).send({error:'failure!!!'})
    }

})*/
router.post('/drivers', async (req, res) => {
    // Create a new driver
    try {
        const driver = new Driver(req.body)
        await driver.save()
        const token = await driver.generateAuthToken()
        res.send({"flag":"1", driver, token })
    } catch (error) {
        res.send({"flag":"0",error})
    }
})

router.post('/drivers/login', async(req, res) => {
    //Login a registered driver
    try {
        const { phoneno, pin} = req.body
        const driver = await Driver.findByCredentials(phoneno, pin)
        if (!driver) {
            return res.status(401).send({"flag":"1",error: 'Login failed! Check authentication credentials'})
        }
        const token = await driver.generateAuthToken()
        res.send({"flag":"1",driver, token })
    } catch (error) {
        res.send({"flag":"1",error:'login failed!!'})
    }
})
router.post('/drivers/update', async(req, res) => {
    const { name, route, phoneno,pin } = req.body
    var filter={ route: route }
    var update={ pin:pin, name:name, phoneno:phoneno}
    var doc = await Driver.findOneAndUpdate(filter, update, {
    new: true
  })
  if(!doc){
    res.send({"flag":"0",error:"not updated"})
  }
  res.send(doc)
})
router.get('/admin/alldrivers', function(req, res) {
    Driver.find({}, function(err, drivers) {
      var driverMap = [];
      var i=0
      drivers.forEach(function(driver) {
        driverMap[i] = driver;
        i=i+1;
      } );
  
      res.send({"flag":"1",driverMap});  
    });
  });
module.exports = router