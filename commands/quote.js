'use strict';

const utils = require("../utils.js");

// Fetches a random message sent by `member` in `channel`
const getRandomMessage = (client, channel, member) => new Promise((resolve, reject) => {
	channel.messages.fetch({limit: 100, around: member.lastMessageID}, false).then(messages => {
		resolve(utils.randItem(messages.array().filter(m => m.author.id === member.id && m.content != "")));
	}).catch(reject);
});

exports.run = (client, message, args) => {

	if (message.channel.type !== "text") {
		return message.channel.send("You can only use this in a server text channel");
	}

	// Find Matt as a member of the server
	const mattMember = message.channel.members.get(client.config.mattID);
	if (!mattMember) return message.channel.send("Matt doesn't seem to be in this channel...");

	// Send the message with the option to change it with the shuffle react
	utils.shuffleMessage(client, message.channel, async () => {
		const randMessage = await getRandomMessage(client, message.channel, mattMember).catch(console.error);
		if (!randMessage)
			return "Matt has been silent recently...";
		else
			return randMessage.content;
	});

};
