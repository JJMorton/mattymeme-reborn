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
			`Used on ${client.guilds.cache.size} servers\n`
		)
		.addFields(client.config.commands.map(c => ({
			name: client.config.prefix + c.name + ' ' + (c.args || []).map(x => `[${x}]`).join(' '),
			value: c.description
		})))
		.setThumbnail(client.user.displayAvatarURL({ size: 64, dynamic: true }))
		.setColor("#dd3333");

	message.channel.send(embed).catch(console.error);
};
