import {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	SlashCommandBuilder,
} from "discord.js";
import { DiceRoller } from "./dice";
import { DiceParseResult, type DiceRollPart, parseDiceNotation } from "./utils";

enum Command {
	Roll = "roll",
	Help = "help",
}

enum MessageContent {
	Input = "input",
}

const availableCommands = [
	new SlashCommandBuilder()
		.setName(Command.Roll)
		.setDescription("Roll dice (e.g. 'd20', '6d12-4', '2d8 + 1d6+4')")
		.addStringOption((option) =>
			option
				.setName("input")
				.setDescription("The dice you want to roll")
				.setRequired(true),
		),
	new SlashCommandBuilder()
		.setName(Command.Help)
		.setDescription("Displays a list of available commands."),
];

export class BoredBot {
	private token: string;
	private applicationId: string;

	private client: Client;
	private commands = availableCommands;

	constructor(token: string, applicationId: string) {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
		});

		this.token = token;
		this.applicationId = applicationId;
	}

	private async login(token: string) {
		if (!token) {
			throw new Error("No token provided when attempting to log in bot");
		}
		try {
			this.client.login(token);
		} catch (error) {
			throw new Error(`Bot failed to log in: ${error}`);
		}
	}

	private async registerCommands(token: string, clientId: string) {
		const rest = new REST({ version: "10" }).setToken(token);
		try {
			await rest.put(Routes.applicationCommands(clientId), {
				body: this.commands,
			});
		} catch (error) {
			throw new Error(`Failed to register slash commands: ${error}`);
		}
	}

	private async setupListeners() {
		this.client.once("ready", () => {
			console.log(`Logged in as '${this.client.user?.tag}'`);
		});

		this.client.on("interactionCreate", async (interaction) => {
			if (!interaction.isChatInputCommand()) return;

			const command = interaction.commandName as Command;
			const userName = interaction.user.displayName;
			const userInput = interaction.options.getString(MessageContent.Input);

			if (!userInput) throw new Error("Expected input to be defined");

			switch (command) {
				case Command.Roll: {
					await interaction.reply(
						await this.handleRollCommand(userInput, userName),
					);
				}
			}
		});
	}

	public async initialize() {
		try {
			await this.login(this.token);
			await this.registerCommands(this.token, this.applicationId);
			await this.setupListeners();
		} catch (error) {
			console.log(error);
		}
	}

	private async handleRollCommand(
		inputStringFromUser: string,
		username: string,
	): Promise<string> {
		let parsedInputResult: DiceParseResult = { dices: [], mod: 0 };

		try {
			parsedInputResult = parseDiceNotation(inputStringFromUser);
		} catch (error) {
			if (error instanceof Error) return error.message;
		}

		const roller = new DiceRoller(username);
		const resultsMessages: string[] = [];

		if (parsedInputResult.dices.length === 1) {
			const singleDie = parsedInputResult.dices[0];
			const { rollResult, message } = await roller.roll(singleDie);

			const mod = parsedInputResult.mod;
			const finalResult = rollResult + mod;

			let singleLine = `(${singleDie.toString()}) => ${rollResult}`;
			if (mod !== 0) {
				const sign = mod > 0 ? "+" : "-";
				singleLine += ` ${sign}${Math.abs(mod)} = ${finalResult}`;
			}

			if (message) {
				singleLine += `\n${message}`;
			}

			resultsMessages.push(singleLine);
		} else {
			resultsMessages.push(
				`You rolled ${parsedInputResult.dices.length} dice!`,
			);

			let sum = 0;
			let rollCount = 1;

			for (const dieInput of parsedInputResult.dices) {
				const { rollResult, message } = await roller.roll(dieInput);
				sum += rollResult;

				const prefix = `Roll #${rollCount}: `;
				const suffix = message ? ` **${message}**` : "";

				resultsMessages.push(
					`${prefix}(d${dieInput.toString()}) => ${rollResult}${suffix}`,
				);
				rollCount++;
			}

			const mod = parsedInputResult.mod;
			const finalResult = sum + mod;
			if (mod !== 0) {
				const sign = mod > 0 ? "+" : "-";

				resultsMessages.push(
					`Result: ${sum} ${sign} ${Math.abs(mod)} = ${finalResult}`,
				);
			} else {
				resultsMessages.push(`**Final result: ${sum}**`);
			}
		}

		return resultsMessages.join("\n");
	}
}
