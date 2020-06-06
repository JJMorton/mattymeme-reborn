'use strict';

exports.randItem = arr => arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

exports.playFile = (client, filename, channel) => {
	if (!channel.joinable) return;
	channel.join().then(connection => {
		connection.play(filename, {seek: 0})
			.on("speaking", speaking => {
				if (!speaking) connection.disconnect();
			})
			.on("error", console.error)
	}).catch(console.error);
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

