'use strict';

const { Client } = require("pg");
const client = new Client({
	connectionString: process.env.DATABASE_URL
});
client.on("error", console.error);
let initialised = false;
const commandTable = "commands";
const userTable = "users";

exports.init = async bot => {

	console.log("Initialising database...");

	client.connect();

	await client.query(`
		CREATE TABLE IF NOT EXISTS ${userTable} (
			id BIGINT PRIMARY KEY NOT NULL,
			unknown INTEGER DEFAULT 0 NOT NULL
		)`
	);

	// Create a column for each available command
	const commands = bot.config.commands.map(c => c.name).concat(["unknown"]);
	try {
		for (const command of commands) {
			await client.query(`
				ALTER TABLE ${userTable} ADD COLUMN IF NOT EXISTS ${command} INTEGER DEFAULT 0 NOT NULL
			`);
		}
		initialised = true;
		console.log("Finished initialising database");
	} catch (err) {
		console.error("Failed to initialise database");
		console.error(err);
	}
};

exports.increment = async (userid, command) => {
	if (!initialised) return console.log("Attempt to update uninitialised database");
	try {
		const select = await client.query(`SELECT * FROM ${userTable} WHERE id = ${userid}`);
		const exists = select.rows.length > 0;
		if (!exists) await client.query(`INSERT INTO ${userTable}(id) VALUES (${userid})`);
		await client.query(`UPDATE ${userTable} set ${command} = ${command} + 1 WHERE id = ${userid}`);
	} catch (err) {
		console.error(`Failed to update user ${userid} in table '${commandTable}'`);
		console.error(err);
	}
};

exports.getUser = async userid => {
	const res = await client.query(`SELECT * FROM ${userTable} WHERE id = ${userid}`);
	if (!res.rows.length) throw "User not found";
	const stats = res.rows[0];
	delete stats["id"];
	return stats;
};

process.on("beforeExit", () => client.end());

