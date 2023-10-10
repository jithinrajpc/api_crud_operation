const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
    },
    phone:{
        type:String,
        require:true,
    },
    image:{
        type:String,
        require:true,
    },
    created:{
        type:String,
        require:true,
        default:Date.now,
    },

});
module.exports = mongoose.model("User", userSchema);