'use strict';

const utils = require("../utils.js");

exports.run = (client, message, args) => {
	if (!message.member) return;
	const channel = message.member.voice.channel;
	if (!channel) return message.reply("Join a voice channel first");
	utils.matchFiles(`${client.config.assetsDir}/joinsounds`, new RegExp(`^${client.config.mattID}_[0-9]+\.mp3$`)).then(files => {
		if (files.length) utils.playFile(client, utils.randItem(files), channel);
	}).catch(console.error);
};

