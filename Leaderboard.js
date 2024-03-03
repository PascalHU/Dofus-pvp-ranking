const mongoose = require("mongoose");

const Data = mongoose.model('Data', {
    pseudo : String,
    Score : Number
});

module.exports = Data;