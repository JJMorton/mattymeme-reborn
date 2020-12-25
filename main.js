'use strict';

const process = require('process');
const https = require('https');
const fs = require('fs');
const express = require('express');
const Discord = require("discord.js");
const client = new Discord.Client();
const utils = require("./utils.js");
const db = require("./db.js");

client.config = {
	prefix: "matty ",
	mattID: "168044647174635522",
	commands: [
		{ name: "ping", description: "pong" },
		{ name: "meme", description: "Send a random matty meme, shuffle with the react button" },
		{ name: "quote", description: "Quote a random message recently sent by Matt" },
		{ name: "cd", description: "Play a variation of 'cd meme' in the voice channel" },
		{ name: "cave", description: "Play a cave sound in the voice channel" },
		{ name: "recordme", args: ["effect"], description: "Send a recording of yourself in the chat\nValid effects: `loud`, `reverse`" },
		{ name: "stats", description: "View how many times you've used commands" },
		{ name: "help", description: "Send this help menu" }
	],
	confused: [
		"huh?",
		"What?",
		"I don't understand",
		"What are you saying?",
		"That means nothing to me",
		"Speak a language I understand",
		"You want a fight?",
		":thinking:",
		"You what mate",
		"nah",
		"how",
		"problem?",
		"did I say you could speak?",
		":moyai:",
		":flushed:"
	],
	assetsDir: `${__dirname}/assets/`
};

client.config.memes = fs.readFileSync(`${client.config.assetsDir}/memes.txt`).toString().trim().split("\n");

/*
 * Database for command statistics
 */

db.init(client);


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

	db.incrementMessage(message.author.id, message.guild.id);

	// Ignore bots
	if (message.author.bot) return;

	// Ignore not on servers
	if (message.channel.type !== "text") return;

	// Ignore if not starting with prefix
	if (message.content.toLowerCase().indexOf(client.config.prefix.toLowerCase()) !== 0) return;

	// Split into arguments
	const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	if (client.config.commands.find(c => c.name === command)) {
		const file = require(`./commands/${command}.js`);
		console.log(`Sender: ${message.author.username}, Command: ${command}, Arguments: ${args.join(', ')}`);
		db.incrementCommand(message.author.id, message.guild.id, command).then(() => {
			file.run(client, message, args);
		});
	} else {
		// Invalid command, send a confused response
		db.incrementCommand(message.author.id, message.guild.id, "unknown");
		message.reply(utils.randItem(client.config.confused));
	}

});


/*
 * Joining sounds
 */

let lastChannelJoined = null;
client.on("voiceStateUpdate", (oldState, newState) => {
	// If the user joined a channel
	if (newState.channelID && !oldState.channelID) {
		lastChannelJoined = newState.channel;
		// Play a random audio sample that begins with the user's ID
		utils.matchFiles(`${client.config.assetsDir}/joinsounds/`, new RegExp(`^${newState.member.id}_[0-9]+\.mp3$`)).then(files => {
			if (files.length) utils.playFile(client, utils.randItem(files), newState.channel);
		}).catch(console.error);
	}
});


/*
 * Random cave sounds
 */

(function playCaveSound(didPlay) {
	// If a call was occupied last time, wait longer before trying again so as not to spam
	const minTime = 1000 * 60 * 60 * (didPlay ? 3 : 2);
	const maxTime = 1000 * 60 * 60 * (didPlay ? 4 : 3);
	const delay = Math.random() * (maxTime - minTime) + minTime;

	setTimeout(() => {
		console.log("Playing cave sound if a call is occupied...");
		const shouldPlay = lastChannelJoined && lastChannelJoined.members.size > 0;
		if (shouldPlay) {
			utils.matchFiles(`${client.config.assetsDir}/cave/`, /^Cave[1-9][0-9]*\.mp3$/).then(files => {
				if (files.length) utils.playFile(client, utils.randItem(files), lastChannelJoined);
			}).catch(console.error);
		}
		playCaveSound(shouldPlay);
	}, delay);

}(false));


/*
 * Log in client
 */

client.on('ready', () => {
    client.user.setPresence({activity: { name: 'with Maia' }}).catch(console.error);
	console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

// Ping itself every 15 minutes to keep it alive
setInterval(() => https.get("https://mattymeme-reborn.herokuapp.com/"), 15 * 60 * 1000);

// Clean up on exit
process.on("beforeExit", () => {
	console.log("Cleaning up...");
	client.destroy();
});

