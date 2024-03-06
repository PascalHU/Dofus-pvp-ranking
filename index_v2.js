require('dotenv').config();
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const { Client, EmbedBuilder } =  require("discord.js");
const PREFIX = "!!"; // Prefix d'une commande
const Ladderboard = require("./Ladder");
const Tesseract = require('tesseract.js');
const download = require('image-downloader');
const Jimp = require("jimp");
const fs = require("fs")

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

/*
    id Saylma : 1109761062447890452
    id Sky : 186483704325996544

    screen perco id : 1203867919457722388
    test id : 1213935302381408288
*/

// Command Part 
client.on("messageCreate", async message => {
    if(message.channelId === '1203867919457722388' || message.channelId === "1213935302381408288"){
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
                    for(let i = 0; i < result.length; i++){
                        rank = rank.concat(i+1).concat("\n")
                        pseudo = pseudo.concat(result[i].pseudo).concat("\n")
                        score = score.concat(result[i].score).concat("\n")
                    }
                    const exampleEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('OPBAR Ranking')
                    .setAuthor({ name: " "})
                    .addFields(
                        { name: 'Rank', value: rank, inline: true },
                        { name: 'Pseudo', value: pseudo, inline: true },
                        { name: 'Score', value: score, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: "Saylma j'attend mon enclos è_é - Skyno"});
                
                    message.reply({ embeds: [exampleEmbed] });
                } catch(error){
                    message.reply("Pas de classement en cours")
                }
            }
        }
    }
})

async function downloadImage(url, filepath) {
    return download.image({
       url,
       dest: filepath 
    });
}

// Approval part
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.channelId === "1203867919457722388" || reaction.message.channelId ==="1213935302381408288"){
        if(user.id === '186483704325996544' || user.id === "1109761062447890452"){
            if (reaction.emoji.name === "✅") {
                const regex = new RegExp("[A-z]")
                const raw_image = reaction.message.attachments.first().url+".png"
                await downloadImage(raw_image, "../../img.png")
                await Jimp.read("img.png").then(function (image) {
                    image.greyscale()
                         .quality(60)
                         .resize(5000, Jimp.AUTO)
                         .dither565() 
                         .invert()
                         .normalize()
                         .write("img-opt.png");
                })
                const ret = await Tesseract.recognize("img-opt.png")
                const formated = ret.data.text.trim().split(" ")
                let raw_name = []
                let name =[]
                for(let i=0; i <formated.length; i++){
                    if(regex.test(formated[i].trim()) && formated[i].trim().length > 2 ){
                        console.log(formated[i])
                        raw_name.push(formated[i])
                    }
                }
                for(let x=0 ; x < raw_name.length; x++){
                    if(raw_name[x].toLowerCase().includes("gagnants"))
                    {
                        for(let i = x; i< raw_name.length; i++){ 
                            if (name.length >= 5){
                                break
                            }
                            else if(
                                raw_name[i].toLowerCase().includes("0") || raw_name[i].toLowerCase().includes("1") ||
                                raw_name[i].toLowerCase().includes("2") || raw_name[i].toLowerCase().includes("3") ||
                                raw_name[i].toLowerCase().includes("4") || raw_name[i].toLowerCase().includes("5") ||
                                raw_name[i].toLowerCase().includes("6") || raw_name[i].toLowerCase().includes("7") ||
                                raw_name[i].toLowerCase().includes("8") || raw_name[i].toLowerCase().includes("9") ||
                                raw_name[i].toLowerCase().includes("(") || raw_name[i].toLowerCase().includes(")") ||
                                raw_name[i].toLowerCase().includes("[") || raw_name[i].toLowerCase().includes("]") ||
                                raw_name[i].toLowerCase().includes("\\") || raw_name[i].toLowerCase().includes("'") ||
                                raw_name[i].toLowerCase().includes("\n") || raw_name[i].toLowerCase().includes("è") || raw_name[i].toLowerCase().includes("perdants") ||
                                raw_name[i].toLowerCase().includes("é") || raw_name[i].toLowerCase().includes(" ") || raw_name[i].toLowerCase().includes("gagnants") ||
                                raw_name[i].toLowerCase().includes("|") || raw_name[i].toLowerCase().includes("/") || raw_name[i].toLowerCase().includes("‘") ||
                                raw_name[i].toLowerCase().includes("kamas") || raw_name[i].toLowerCase().includes("objets")){}
                            else{
                                name.push(raw_name[i])
                            }
                        }
                        for(let i = 0; i < name.length; i++){
                            const user_score = await Ladderboard.findOne({pseudo: name[i].toLowerCase().trim()})
                            if(!user_score){
                                const newUser = new Ladderboard({
                                    pseudo: name[i].toLowerCase().trim(),
                                    score: 1
                                })
                                await newUser.save() 
                            }
                            if(user_score){
                                const newScore ={ score: user_score.score + 1}
                                await user_score.updateOne(newScore)
                            }
                        }
                    }
                }
            }
            else if (reaction.emoji.name === "❎") {
                const regex = new RegExp("[A-z]")
                const raw_image = reaction.message.attachments.first().url+".png"
                await downloadImage(raw_image, "../../img.png")
                await Jimp.read("img.png").then(function (image) {
                    image.greyscale()
                         .quality(60)
                         .resize(5000, Jimp.AUTO)
                         .dither565()  
                         .invert()
                         .normalize()
                         .write("img-opt.png");
                })
                    
                const ret = await Tesseract.recognize("img-opt.png")
                const formated = ret.data.text.trim().split(" ")
                let raw_name = []
                let name =[]
                for(let i=0; i <formated.length; i++){
                    if(regex.test(formated[i].trim()) && formated[i].trim().length > 3 ){
                        raw_name.push(formated[i])
                    }
                }
                for(let x=0 ; x < raw_name.length; x++){
                    if(raw_name[x].toLowerCase().includes("perdants"))
                    {
                        for(let i = x; i< raw_name.length; i++){ 
                            if (name.length >= 5){
                                break
                            }
                            else if(
                                raw_name[i].toLowerCase().includes("0") || raw_name[i].toLowerCase().includes("1") ||
                                raw_name[i].toLowerCase().includes("2") || raw_name[i].toLowerCase().includes("3") ||
                                raw_name[i].toLowerCase().includes("4") || raw_name[i].toLowerCase().includes("5") ||
                                raw_name[i].toLowerCase().includes("6") || raw_name[i].toLowerCase().includes("7") ||
                                raw_name[i].toLowerCase().includes("8") || raw_name[i].toLowerCase().includes("9") ||
                                raw_name[i].toLowerCase().includes("(") || raw_name[i].toLowerCase().includes(")") ||
                                raw_name[i].toLowerCase().includes("[") || raw_name[i].toLowerCase().includes("]") ||
                                raw_name[i].toLowerCase().includes("\\") || raw_name[i].toLowerCase().includes("'") ||
                                raw_name[i].toLowerCase().includes("\n") || raw_name[i].toLowerCase().includes("è") || raw_name[i].toLowerCase().includes("perdants") ||
                                raw_name[i].toLowerCase().includes("é") || raw_name[i].toLowerCase().includes(" ") || raw_name[i].toLowerCase().includes("gagnants") ||
                                raw_name[i].toLowerCase().includes("|") || raw_name[i].toLowerCase().includes("/") || raw_name[i].toLowerCase().includes("‘") ||
                                raw_name[i].toLowerCase().includes("kamas") || raw_name[i].toLowerCase().includes("objets")){}
                            else{
                                name.push(raw_name[i])
                            }
                        }
                        for(let i = 0; i < name.length; i++){
                            const user_score = await Ladderboard.findOne({pseudo: name[i].toLowerCase().trim()})
                            if(!user_score){
                                const newUser = new Ladderboard({
                                    pseudo: name[i].toLowerCase().trim(),
                                    score: 1
                                })
                                await newUser.save() 
                            }
                            if(user_score){
                                const newScore ={ score: user_score.score + 1}
                                await user_score.updateOne(newScore)
                            }
                        }
                    }
                }
            }   
        }
    }
});

client.login(process.env.DISCORD_KEY);

const server = app.listen(process.env.PORT || 4000, () => {
    console.log("Server Started 🚀");
  });