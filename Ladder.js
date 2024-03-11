const mongoose = require("mongoose");

const Ladder = mongoose.model('Ladder', {
    discord_id : String,
    pseudo : String,
    score : Number
});

module.exports = Ladder;