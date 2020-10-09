'use strict';

const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { OpusEncoder } = require("@discordjs/opus");
const utils = require("../utils.js");

exports.run = (client, message, args) => {

	const member = message.member;
	if (!member) return;
	const mentions = message.mentions.members;
	if (!member.voice.channel) return message.reply("Join a voice channel first");
	if (!member.voice.channel.joinable) return message.reply("Sorry, I can't join that voice channel");
	member.voice.channel.join().then(connection => {

		const maxRecordingLength = 15000;

		const pcmFile = `recording_${member.user.id}.pcm`;
		const wavFile = `recording_${member.user.id}.wav`;
		let haveData = false;
		const writable = fs.createWriteStream(pcmFile);
		const readable = connection.receiver.createStream(member.user, { end: "manual", mode: "pcm" });
		readable.pipe(writable);

		writable.on("error", err => {
			console.error("Error writing to file");
			console.error(err);
			connection.disconnect();
		});
		readable.on("error", err => {
			console.error("There was an error receiving the audio stream");
			console.error(err);
			writable.destroy();
			connection.disconnect();
		});

		readable.on("data", () => haveData = true);

		writable.on("finish", () => {
			connection.disconnect();
			ffmpeg(pcmFile)
				.inputOptions([
					"-f s16le",
					"-ar 48k",
					"-ac 2"
				])
				.on("end", () => {
					const content = haveData ? { files: [{ attachment: wavFile, name: `${member.displayName}.wav` }] } : "I didn't hear anything, am I deaf?";
					message.channel.send(content).then(() => {
						fs.unlink(pcmFile, err => { if (err) console.error(err); });
						fs.unlink(wavFile, err => { if (err) console.error(err); });
					});
				})
				.on("error", err => {
					console.error("Failed to process audio");
					console.error(err);
					message.channel.send("Failed to process the recording");
				})
				.save(wavFile);
		});

		// The recording is all set up, wait until the user presses the react
		message.reply("Recording your voice, react with ⏹️ to stop").then(reply => {

			reply.react("⏹️").catch(console.error);
			const collector = reply.createReactionCollector(
				(reaction, user) => user.id === member.user.id && reaction.emoji.name === '⏹️',
				{ time: maxRecordingLength }
			);

			// The user reacted (or the maximum length was reached), process the audio and send it
			collector.on("collect", () => collector.stop());
			collector.on("end", () => {
				reply.delete().catch(console.error);
				if (!writable.writableEnded) writable.end();
			});

		});

	}).catch(console.error);
};

