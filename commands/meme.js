'use strict';

const utils = require("../utils.js");

exports.run = (client, message, args) => {
	if (!client.config.memes.length) return console.error("Nothing in memes.txt");
	message.channel.send(utils.randItem(client.config.memes))
		.then(reply => {
			reply.react('🔀') // The :repeat: emoji
				.then(() => {
					const collector = reply.createReactionCollector(
						(reaction, user) => !user.bot && reaction.emoji.name === '🔀',
						{ time: 300000 }
					);
					collector.on("collect", r => r.message.edit(utils.randItem(client.config.memes)))
				})
				.catch(console.error);
		})
		.catch(console.error);
};

