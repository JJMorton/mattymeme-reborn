'use strict';

const Discord = require("discord.js");
const utils = require("../utils.js");

exports.run = (client, message, args) => {
	const embed = new Discord.MessageEmbed()
		.setTitle("MattyMeme")
		.setDescription("The following commands are available:")
		.addFields([
			{ name: `${client.config.prefix} ping`, value: "pong!" },
			{ name: `${client.config.prefix} meme`, value: "Send a random matty meme, shuffle with the react button" },
			{ name: `${client.config.prefix} help`, value: "Send this help menu" }
		])
		.setFooter(`Uptime: ${utils.formatTime(client.uptime)}`)
		.setURL("https://mattymeme-reborn.herokuapp.com")
		.setColor("#dd3333");

	message.channel.send(embed).catch(console.error);
};
