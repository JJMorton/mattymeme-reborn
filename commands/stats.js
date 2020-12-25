'use strict';

const Discord = require("discord.js");
const db = require("../db.js");

exports.run = (client, message, args) => {
	const member = message.mentions.members.first() || message.member;
	const userid = member.id;
	const guildid = message.guild.id;
	db.getUser(userid, guildid).then(stats => {

		const commandsTotal = Object.values(stats.commands).reduce((x, sum) => sum + x);
		const messagesTotal = Object.values(stats.hours).reduce((x, sum) => sum + x);
		let messagesPeak = stats.hours.reduce((maxi, x, i, arr) => (x > arr[maxi] ? i : maxi), 0);
		const messagesPeakDate = new Date();
		messagesPeakDate.setHours(messagesPeak);
		const messagesPeakHour = messagesPeakDate.toLocaleString('en-US', { hour: 'numeric', hour12: true });
		const messagesPeakPerc = Math.round(100 * stats.hours[messagesPeak] / messagesTotal);

		const embed = new Discord.MessageEmbed();
		const fields = Object.entries(stats.commands).map(x => ({
			name: x[0],
			value: "**" + x[1] + "** use" + (x[1] === 1 ? "" : "s"),
			inline: true
		}));
		embed.setDescription(
			`Total of **${messagesTotal}** messages sent on this server\n` +
			`Peak time of **${messagesPeakHour}**, with **${messagesPeakPerc}%** of messages being sent at this time\n` +
			`\n` +
			`Typed **${commandsTotal}** commands in total:`
		);
		embed.addFields(fields);
		embed.setFooter(`${member.displayName}'s stats for this server`, member.user.displayAvatarURL());
		embed.setColor(member.displayColor);
		message.channel.send(embed);
	}).catch(err => {
		console.error("Failed to get user stats");
		console.error(err);
	});
};

