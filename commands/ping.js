'use strict';

exports.run = (client, message, args) => {
	message.channel.send("bazinga").catch(console.error);
};

