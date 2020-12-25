'use strict';

/*
 * ----------------------
 * TABLE members
 * ----------------------
 * id PRIMARY KEY
 * guild_id PRIMARY KEY
 *
 * command_unknown
 * command_ping
 * command_stats
 * ...
 * command_help
 *
 * hour_0
 * hour_1
 * hour_2
 * ...
 * hour_23
 *
 */

const { Client } = require("pg");
const client = new Client({
	connectionString: process.env.DATABASE_URL
});
client.on("error", console.error);
let initialised = false;
const memberTable = "members";

exports.init = async bot => {

	console.log("Initialising database...");

	client.connect();

	// Create a column for each hour of the day to track when users send messages the most
	let createQuery = `CREATE TABLE IF NOT EXISTS ${memberTable} (
		id BIGINT NOT NULL,
		guild_id BIGINT NOT NULL,
		${[...Array(24).keys()].map(hour => `hour_${hour} INTEGER DEFAULT 0 NOT NULL`).join(", ")},
		PRIMARY KEY (id, guild_id)
	);`;

	// Create a column for each available command to track how often users use them
	let commandsQuery = `ALTER TABLE ${memberTable} `;
	const commands = bot.config.commands.map(c => c.name).concat(["unknown"]);
	commandsQuery += commands.map(command => `ADD COLUMN IF NOT EXISTS command_${command} INTEGER DEFAULT 0 NOT NULL`).join(", ");
	commandsQuery += ";";

	try {
		console.log("Querying database:", createQuery);
		await client.query(createQuery);
		console.log("Querying database:", commandsQuery);
		await client.query(commandsQuery);
		initialised = true;
		console.log("Finished initialising database");
	} catch (err) {
		console.error("Failed to initialise database");
		console.error(err);
	}
};

exports.incrementCommand = async (userid, guildid, command) => {
	if (!initialised) return console.log("Attempt to update uninitialised database");
	try {
		const select = await client.query(`SELECT * FROM ${memberTable} WHERE id = ${userid} AND guild_id = ${guildid}`);
		const exists = select.rows.length > 0;
		if (!exists) await client.query(`INSERT INTO ${memberTable}(id, guild_id) VALUES (${userid}, ${guildid})`);
		await client.query(`UPDATE ${memberTable} set command_${command} = command_${command} + 1 WHERE id = ${userid} AND guild_id = ${guildid}`);
	} catch (err) {
		console.error(`Failed to update user ${userid} in table '${memberTable}'`);
		console.error(err);
	}
};

exports.incrementMessage = async (userid, guildid) => {
	if (!initialised) return console.log("Attempt to update uninitialised database");
	const hour = new Date().getHours();
	try {
		const select = await client.query(`SELECT * FROM ${memberTable} WHERE id = ${userid} AND guild_id = ${guildid}`);
		const exists = select.rows.length > 0;
		if (!exists) await client.query(`INSERT INTO ${memberTable}(id, guild_id) VALUES (${userid}, ${guildid})`);
		await client.query(`UPDATE ${memberTable} set hour_${hour} = hour_${hour} + 1 WHERE id = ${userid} AND guild_id = ${guildid}`);
	} catch (err) {
		console.error(`Failed to update user ${userid} in table '${memberTable}'`);
		console.error(err);
	}
}

exports.getUser = async (userid, guildid) => {
	const res = await client.query(`SELECT * FROM ${memberTable} WHERE id = ${userid} AND guild_id = ${guildid}`);
	if (!res.rows.length) throw "User not found";
	const row = res.rows[0];

	const stats = {
		commands: {},
		hours: Array(24)
	}
	Object.keys(row).forEach(key => {
		if (key.startsWith("command_")) {
			stats.commands[key.substring("command_".length)] = row[key];
		} else if (key.startsWith("hour_")) {
			stats.hours[parseInt(key.substring("hour_".length))] = row[key];
		}
	});

	return stats;
};

process.on("beforeExit", () => client.end());

