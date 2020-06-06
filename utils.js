'use strict';

exports.randItem = arr => arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

exports.playFile = (client, filename, channel) => {
	if (!filename || !channel) return;
	if (!channel.joinable) return;
	channel.join().then(connection => {
		connection.play(filename, {seek: 0})
			.on("speaking", speaking => {
				if (!speaking) connection.disconnect();
			})
			.on("error", console.error)
	}).catch(console.error);
};

