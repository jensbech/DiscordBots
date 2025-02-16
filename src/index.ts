// import { Elysia } from "elysia";
import { BoredBot } from "./discord";

// const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

// const token = process.env.BORED_BOT_DISCORD_TOKEN as string;
const token =
	"MTM0MDY3MjY5MzA4Mjc4Mzg0OQ.Gtw0Xb.WrVud3xZBC4JcTpyiLMhRP-AEzPtr3q_05jDEg";
const bot = new BoredBot();

await bot.start(token);
