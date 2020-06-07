'use strict';

const utils = require("../utils.js");

exports.run = (client, message, args) => {

	if (message.channel.type !== "text") {
		return message.channel.send("You can only use this in a server text channel");
	}

	if (!client.config.memes.length) return console.error("assets/memes.txt is empty");

	// Send a random meme, with the shuffle react option
	utils.shuffleMessage(client, message.channel, () => utils.randItem(client.config.memes));
};

