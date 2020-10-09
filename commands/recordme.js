'use strict';

const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { OpusEncoder } = require("@discordjs/opus");
const utils = require("../utils.js");

const effects = {
	"loud": [ "bass=gain=70", "volume=60", "acrusher=1:0.2:64", "crystalizer" ],
	"reverse": [ "areverse" ]
};

exports.run = (client, message, args) => {

	const member = message.member;
	if (!member) return;
	const mentions = message.mentions.members;
	if (!member.voice.channel)
		return message.reply("Join a voice channel first");
	if (!member.voice.channel.joinable)
		return message.reply("Sorry, I can't join that voice channel");
	if (!args.every(a => effects.hasOwnProperty(a)))
		return message.reply(`Invalid effect specified, use \`${client.config.prefix} help\` to see the available effects`);

	member.voice.channel.join().then(connection => {

		// Playing a file seems to fix the issue where no audio is received
		connection.play("assets/message.mp3", {seek: 0});

		const maxRecordingLength = 30000;

		const pcmFile = `recording_${member.user.id}.pcm`;
		const mp3File = `recording_${member.user.id}.mp3`;
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

		// Once the pcm has been recorded, convert and send to the discord channel
		writable.on("finish", () => {
			connection.disconnect();
			const audioProcess = ffmpeg(pcmFile)
				.inputOptions([
					"-f s16le",
					"-ar 48k",
					"-ac 2"
				])
				.on("end", () => {
					const content = haveData ? { files: [{ attachment: mp3File, name: `${member.displayName}.mp3` }] } : "I didn't hear anything, am I deaf?";
					message.channel.send(content).then(() => {
						fs.unlink(pcmFile, err => { if (err) console.error(err); });
						fs.unlink(mp3File, err => { if (err) console.error(err); });
					});
				})
				.on("error", err => {
					console.error("Failed to process audio");
					console.error(err);
					message.channel.send("Failed to process the recording");
				});
			args.forEach(effect => {
				audioProcess.audioFilters(...effects[effect]);
			});
			audioProcess.save(mp3File);
		});

		// The recording is all set up, wait until the user presses the react
		message.reply("Recording your voice, react with ⏹️ to stop").then(reply => {

			reply.react("⏹️").catch(console.error);
			const collector = reply.createReactionCollector(
				(reaction, user) => user.id === member.user.id && reaction.emoji.name === '⏹️',
				{ time: maxRecordingLength }
			);

			// The user reacted (or the maximum length was reached), close the write stream
			collector.on("collect", () => collector.stop());
			collector.on("end", () => {
				reply.delete().catch(console.error);
				if (!writable.writableEnded) writable.end();
			});

		});

	}).catch(console.error);
};

