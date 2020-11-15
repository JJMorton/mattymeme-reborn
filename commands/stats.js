'use strict';

const Discord = require("discord.js");
const db = require("../db.js");

exports.run = (client, message, args) => {
	const userid = message.author.id;
	db.getUser(userid).then(stats => {
		const total = Object.values(stats).reduce((x, sum) => sum + x);
		const embed = new Discord.MessageEmbed();
		embed.addFields(Object.entries(stats).map(x => ({ name: x[0], value: x[1], inline: true })));
		embed.setFooter(`${message.member.displayName} has typed ${total} commands in total`, message.author.displayAvatarURL());
		embed.setColor(message.member.displayColor);
		message.channel.send(embed);
	}).catch(err => {
		console.error("Failed to get user stats");
		console.error(err);
	});
};

