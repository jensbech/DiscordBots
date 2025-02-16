import {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	SlashCommandBuilder,
} from "discord.js";
import { DiceRoller } from "./dice";
import { parseDiceNotation } from "./utils";

enum Command {
	Roll = "roll",
}

enum MessageContent {
	Input = "input",
}

const availableCommands = [
	new SlashCommandBuilder()
		.setName(Command.Roll)
		.setDescription("Roll dice (e.g. 'd20', '2d10', 'd12+4'")
		.addStringOption((option) =>
			option
				.setName("input")
				.setDescription("The dice you want to roll")
				.setRequired(true),
		),
];

export class BoredBot {
	private token: string;
	private clientId: string;

	private client: Client;
	private commands = availableCommands;

	constructor(token: string, clientId: string) {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
		});

		this.token = token;
		this.clientId = clientId;
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

			await this.registerCommands(this.token, this.clientId);
			await this.setupListeners();
		} catch (error) {
			console.log(error);
		}
	}

	private async handleRollCommand(inputValue: string, username: string) {
		console.log("Received roll input", inputValue);

		// todo support several rolls in one call
		try {
			const { base, mod } = parseDiceNotation(inputValue);
			const roller = new DiceRoller(username);
			const { result, message } = await roller.roll(base, mod);
			return "ok";
		} catch (error) {
			return "error!";
		}
	}
}
