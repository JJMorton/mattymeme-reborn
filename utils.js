'use strict';

/*
 * Some common functions that are used in multiple different commands
 */

// Chooses a random item from an array
exports.randItem = arr => arr[Math.floor(Math.random() * arr.length)];

// Plays the specified sound file in the voice channel `channel`
exports.playFile = (client, filename, channel) => {
	if (!channel.joinable) return;
	channel.join().then(connection => {
		const dispatcher = connection.play(filename, {seek: 0})
		dispatcher.on("speaking", speaking => {
			if (!speaking) connection.disconnect();
		});
		dispatcher.on("error", console.error);
	}).catch(console.error);
};

// Sends a message created by `messageConstructor` to channel.
// When the shuffle react is pressed, the message will be recreated by `messageConstructor`
// `messageConstructor` can be asynchronous
exports.shuffleMessage = async (client, channel, messageConstructor) => {
	// Send an initial message, react to it and then listen for reactions from users
	const message = await channel.send(await messageConstructor()).catch(console.error);
	if (!message || !message.editable) return;
	const reaction = await message.react('🔀').catch(console.error);
	const collector = message.createReactionCollector(
		(reaction, user) => !user.bot && reaction.emoji.name === '🔀',
		{ time: 300000 }
	);
	// When a user adds a reaction, regenerate the message
	collector.on("collect", async r => message.edit(await messageConstructor()).catch(console.error));
	// Remove the bot's reaction when finished listening for reactions
	collector.on("end", () => reaction.users.remove(client.user).catch(console.error));
};

// convert ms to an appropriate unit of time
exports.formatTime = ms => {
	const seconds = (ms / 1000).toFixed(1);
	const minutes = (ms / (1000 * 60)).toFixed(1);
	const hours = (ms / (1000 * 60 * 60)).toFixed(1);
	const days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

	if (seconds < 60) {
		return seconds + " seconds";
	} else if (minutes < 60) {
		return minutes + " minutes";
	} else if (hours < 24) {
		return hours + " hours";
	} else {
		return days + " days";
	}
};

