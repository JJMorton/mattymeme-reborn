'use strict';

const Discord = require("discord.js");
const utils = require("../utils.js");

exports.run = (client, message, args) => {
	const embed = new Discord.MessageEmbed()
		.setTitle("MattyMeme")
		.setDescription(
			`[Funny website](https://mattymeme-reborn.herokuapp.com)\n` +
			`[Invite to your server](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot)\n` +
			`Source on [GitHub](https://github.com/JJMorton/mattymeme-reborn)\n` +
			`Uptime: ${utils.formatTime(client.uptime)}\n` +
			`\n` +
			`__**The following commands are available:**__`
		)
		.addFields([
			{ name: `${client.config.prefix} ping`, value: "pong" },
			{ name: `${client.config.prefix} meme`, value: "Send a random matty meme, shuffle with the react button" },
			{ name: `${client.config.prefix} quote`, value: "Quote a random message recently sent by Matt" },
			{ name: `${client.config.prefix} cd`, value: "Play a variation of 'cd meme' in the voice channel" },
			{ name: `${client.config.prefix} cave`, value: "Play a cave sound in the voice channel" },
			{ name: `${client.config.prefix} recordme [effect]`, value: "Send a recording of yourself in the chat\nValid effects: `loud`, `reverse`" },
			{ name: `${client.config.prefix} help`, value: "Send this help menu" }
		])
		.setThumbnail(client.user.displayAvatarURL({ size: 64, dynamic: true }))
		.setColor("#dd3333");

	message.channel.send(embed).catch(console.error);
};
