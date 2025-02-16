import { Elysia } from "elysia";
import { BoredBot } from "./discord";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

// const token = process.env.BORED_BOT_DISCORD_TOKEN as string;
const token = "";
const clientId = "";
const bot = new BoredBot(token, clientId);

await bot.initialize();
