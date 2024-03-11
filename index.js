const { setTimeout } =  require("timers/promises");
require('dotenv').config();
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const { Client, EmbedBuilder } =  require("discord.js");
const PREFIX = "!!"; // Prefix d'une commande
const Ladderboard = require("./Ladder");

app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const client = new Client({
    intents: ["Guilds","GuildMessages","MessageContent","GuildMessageReactions"]
});

client.on("ready",() => {
    client.user.setPresence({
        activities: [{
            name: "Compteur de patates"
        }],
        status :"dnd"
    });
    console.log(`Connecté comme ${client.user.tag}`);
})

/*
    id Saylma : 1109761062447890452
    id Sky : 186483704325996544

    screen perco id : 1203867919457722388
    test id : 1213935302381408288
*/

// Command Part 
client.on("messageCreate", async message => {
    if(message.channelId === "1203867919457722388" || message.channelId === "1216400187078213692"){
        if(message.member.id === "186483704325996544" || message.member.id === "1109761062447890452" && message.content.startsWith(PREFIX)){
            const input = message.content.slice(PREFIX.length).trim().toLowerCase()
            if(input === "reset"){
                await Ladderboard.deleteMany()
                message.reply("Remis à 0")
            }
        }
        if(message.member.id !== client.user.id && message.content.startsWith(PREFIX))
        {
            const input = message.content.slice(PREFIX.length).trim().toLowerCase()
            if(input === "rank"){
                try{
                    const result = await Ladderboard.find({},["pseudo","score"],{sort:{ score: -1 }})
                    let rank = "" 
                    let pseudo = ""
                    let score = ""
                    if(result.length === 0){
                        message.reply("Pas de classement en cours")
                    }
                    else{
                        for(let i = 0; i < result.length; i++){
                            rank = rank.concat(i+1).concat("\n")
                            pseudo = pseudo.concat(result[i].pseudo[0].toUpperCase() + result[i].pseudo.slice(1)).concat("\n")
                            score = score.concat(result[i].score).concat("\n")
                        }
                        const exampleEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('OPBAR PVP Ranking')
                        .setAuthor({ name: " "})
                        .addFields(
                            { name: 'Rank', value: rank, inline: true },
                            { name: 'Pseudo', value: pseudo, inline: true },
                            { name: 'Score', value: score, inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: "/w Skynowalker si y'a des bug"});
                    
                        message.reply({ embeds: [exampleEmbed] });
                    }
                } catch(error){
                    message.reply("Erreur è_é !")
                }
            }
        }
    }
})

// Approval part
client.on('messageReactionAdd', async (reaction, user) => {
    if ((reaction.message.channelId === "1203867919457722388" || reaction.message.channelId === "1216400187078213692") && (user.id === '186483704325996544' || user.id === "1109761062447890452") && (reaction.emoji.name === "✅" || reaction.emoji.name === "❎")){
        
        // How much point
        let point = 0
        if(reaction.emoji.name ===  "✅" ){
            point = 1
        }
        else{
            point = 0.25
        }

        const key = reaction.message.content.split(" ")
        for(let i = 0; i < key.length; i++){
            if(key[i]){
                const user_score = await Ladderboard.findOne({discord_id: key[i]})
                if(!user_score){
                    let thanos = client.users.fetch(key[i].slice(2,-1))
                    thanos.then(async function(pseudo) {
                    let end_pseudo = ""
                    if(pseudo.globalName){
                        end_pseudo = pseudo.globalName
                    }
                    else
                    {
                        end_pseudo= key[i]
                    }
                    console.log(pseudo)
                    console.log("New pseudo ->" + end_pseudo + "            Discord ID =>" + key[i])
                    if(pseudo.globalName){}
                    const newUser = new Ladderboard({
                        discord_id: key[i],
                        pseudo: end_pseudo,
                        score: point
                    })
                    await newUser.save() 
                })}
                if(user_score){
                    const newScore ={ score: user_score.score + point}
                    await user_score.updateOne(newScore)
                }
            
                await setTimeout(100)
            }
        }
    }
})
        
client.login(process.env.DISCORD_KEY);

const server = app.listen(process.env.PORT || 4000, () => {
    console.log("Server Started 🚀");
  });
  782264562799476776