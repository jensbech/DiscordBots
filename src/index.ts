import { Elysia } from "elysia";
import { BoredBot } from "./boredBot";
import { boredBotCommands } from "./boredBot/commands";

new Elysia().get("/", () => "Hello Elysia").listen(3000);
await BoredBot.getInstance(process.env.TOKEN, process.env.APPLICATION_ID, boredBotCommands);
