require('dotenv').config();
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express()
const { Client } =  require("discord.js");
const PREFIX = "!!"; // Prefix d'une commande
const leaderboard = require("../Leaderboard");

app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const client = new Client({
    intents: ["Guilds","GuildMessages","MessageContent","GuildMessageReactions"]
});

client.on("ready",() => {
    client.user.setPresence({
        activities: [{
            name: "Compteur de potatoes"
        }],
        status :"dnd"
    });
    console.log(`Connecté comme ${client.user.tag}`);
})

// Command Part 
client.on("messageCreate", async message => {
    if(message.member.id === "186483704325996544" && message.content.startsWith(PREFIX)){
        const input = message.content.slice(PREFIX.length).trim()
        console.log(input)
        if(input.toLowerCase() === "reset"){
            message.reply("Reset")
        }
    }
    if(message.member.id !== client.user.id && message.content.startsWith(PREFIX)){
        const input = message.content.slice(PREFIX.length)
        console.log(message.content)
    }
})

// Approval part
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.name === "✅" && user.id === '186483704325996544') {
        const key = reaction.message.content.trim().split(",")
        for(let i = 0; i < key; i++){
            const user_score = await leaderboard.findOne({pseudo: key[i].toLowerCase()})
            if(!user_score){
                const newUser = new data({
                    pseudo: key[i].toLowerCase(),
                    score: 1
                })
                await newUser.save()
            }
        }
    }
});

client.login(process.env.DISCORD_KEY);

const server = app.listen(process.env.PORT || 4000, () => {
    console.log("Server Started 🚀");
  });