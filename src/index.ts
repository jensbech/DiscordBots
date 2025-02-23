import { Elysia } from "elysia";
import { BoredBot } from "./boredBot";
import { boredBotCommands } from "./boredBot/commands";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

const token = "";
const applicationId = "";

await BoredBot.getInstance(token, applicationId, boredBotCommands);
