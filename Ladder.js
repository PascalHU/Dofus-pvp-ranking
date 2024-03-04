const mongoose = require("mongoose");

const Ladder = mongoose.model('Ladder', {
    pseudo : String,
    score : Number
});

module.exports = Ladder;