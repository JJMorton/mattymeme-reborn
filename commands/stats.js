'use strict';

const Discord = require("discord.js");
const db = require("../db.js");

exports.run = (client, message, args) => {
	const userid = message.author.id;
	db.getUser(userid).then(stats => {
		const embed = new Discord.MessageEmbed();
		const total = Object.values(stats).reduce((x, sum) => sum + x);
		const fields = Object.entries(stats).map(x => ({
			name: x[0],
			value: "**" + x[1] + "** use" + (x[1] === 1 ? "" : "s"),
			inline: true
		}));
		embed.addFields(fields);
		embed.setFooter(`${message.member.displayName} has typed ${total} commands in total`, message.author.displayAvatarURL());
		embed.setColor(message.member.displayColor);
		message.channel.send(embed);
	}).catch(err => {
		console.error("Failed to get user stats");
		console.error(err);
	});
};

