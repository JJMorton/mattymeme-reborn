'use strict';

const fs = require("fs");

/*
 * Some common functions that are used in multiple different commands
 */

// Chooses a random item from an array
exports.randItem = arr => arr[Math.floor(Math.random() * arr.length)];

// Plays the specified sound file in the voice channel `channel`
exports.playFile = (client, filename, channel) => {
	if (!channel.joinable) return;
	channel.join().then(connection => {
		console.log(`Playing file "${filename}"...`);
		const dispatcher = connection.play(filename, {seek: 0})
		dispatcher.on("speaking", speaking => {
			if (!speaking) connection.disconnect();
		});
		dispatcher.on("error", console.error);
	}).catch(console.error);
};

exports.matchFiles = (dir, regex) => {
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, files) => {
			if (err) return reject(new Error(`Unable to read files in directory ${dir}`));
			files = files.filter(file => regex.test(file));
			resolve(files.map(file => dir + "/" + file));
		});
	});
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
	const d = new Date(ms);
	const periods = [
		(ms / (1000 * 60 * 60 * 24)), // days
		(ms / (1000 * 60 * 60)) % 24, // hours
		(ms / (1000 * 60)) % 60, // minutes
		(ms / 1000) % 60 // seconds
	].map(Math.floor);
	const units = [ "day", "hour", "minute", "second" ];
	const sections = [];
	for (let i = 0; i < periods.length && sections.length < 2; i++) {
		if (periods[i] > 0) sections.push(periods[i] + " " + units[i] + (periods[i] === 1 ? "" : "s"));
	}
	return sections.join(" and ");
};

