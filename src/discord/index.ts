import { Client, GatewayIntentBits } from "discord.js";

export class BoredBot {
	private client: Client;

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
		});
	}

	private async login(token: string) {
		if (!token) {
			throw new Error("No token provided when attempting to log in bot");
		}
		console.log("Logging in to Discord...");
		try {
			await this.client.login(token);
			console.log("Logged in!");
		} catch (error) {
			throw new Error(`Bot failed to log in: ${error}`);
		}
	}

	private async setupListeners() {
		this.client.once("ready", () => {
			console.log(`Logged in as ${this.client.user?.tag}`);
		});

		this.client.on("messageCreate", (message) => {
			if (message.author.bot) return;

			console.log(`Read message: ${message.content}`);

			if (message.content === "!ping") {
				message.channel.send("Pong!");
			}
		});
	}

	public async start(token: string) {
		await this.login(token);
		await this.setupListeners();
	}
}
