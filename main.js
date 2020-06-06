'use strict';

const process = require('process');
const https = require('https');
const fs = require('fs');
const express = require('express');
const Discord = require("discord.js");
const client = new Discord.Client();
const utils = require("./utils.js");

const config = {
	prefix: "matty",
	mattID: "168044647174635522",
	confused: [
		"huh?",
		"What?",
		"I don't understand",
		"What are you saying?",
		"That means nothing to me",
		"Speak a language I understand",
		"Are you asking for a fight?",
		"Try the help command",
		"Computer says no.",
		":thinking:"
	]
};


/*
 * Webpage
 */

const app = express();
app.set("port", (process.env.PORT || 8001));
app.use("/", express.static("public"));
app.get("/", function(req, res) {
    res.sendFile("public/index.html", {root : __dirname});
}).listen(app.get("port"), function() {
    console.log("Web server listening on port ", app.get("port"));
});


/*
 * Command handling
 */

client.on('message', message => {

	// Ignore bots
	if (message.author.bot) return;

	// Ignore not on servers
	if (message.channel.type !== "text") return;

	// Ignore if not starting with prefix
	if (message.content.indexOf(config.prefix) !== 0) return;

	// Split into arguments
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	// Find and run command
	try {
		const file = require(`./commands/${command}.js`);
		console.log(`Sender: ${message.author.username}, Command: ${command}, Arguments: ${args.join(', ')}`);
		file.run(client, message, args);
	} catch (err) {
		if (err.code === 'MODULE_NOT_FOUND') {
			// Invalid command, send a confused response
			message.reply(utils.randItem(config.confused));
		} else {
			console.error(err);
		}
	}
});


/*
 * Joining sounds
 */

client.on("voiceStateUpdate", (oldState, newState) => {
	// If the user joined a channel
	if (newState.channelID && !oldState.channelID) {
		fs.readdir("./assets/joinsounds/", (err, files) => {
			if (err) return console.error(err);
			// Play a random audio sample that begins with the user's ID
			const regex = new RegExp(`^${newState.member.id}_[0-9]+\.mp3$`);
			files = files.filter(file => regex.test(file));
			const soundFile = utils.randItem(files);
			if (soundFile) utils.playFile(client, "./assets/joinsounds/" + soundFile, newState.channel);
		});
	}
});


/*
 * Log in client
 */

client.on('ready', () => {
    client.user.setPresence({activity: { name: 'with Maia' }}).catch(console.error);
	console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

setInterval(() => https.get("https://mattymeme-reborn.herokuapp.com/"), 15 * 60 * 1000);

