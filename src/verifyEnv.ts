import { execSync, spawn } from "node:child_process";

function checkDependency(command: string, errorMessage: string) {
	try {
		execSync(`command -v ${command}`, { stdio: "ignore" });
	} catch {
		console.error(errorMessage);
		process.exit(1);
	}
}

function fetchToken(): string {
	try {
		const result = execSync(
			`bw get item discord-bot-token-id | jq -r '.fields[] | select(.name=="token").value'`,
			{ encoding: "utf-8", stdio: "inherit" }
		);
		const token = result.trim();
		if (!token) {
			console.error("Error: Token is empty. Ensure Bitwarden is unlocked and the item has a token field.");
			process.exit(1);
		}
		return token;
	} catch {
		console.error("Error: Failed to fetch the token. Ensure Bitwarden is unlocked.");
		process.exit(1);
	}
}

// Verify dependencies
console.log("Checking dependencies...");
checkDependency("jq", "Error: jq is not installed. Please install jq and try again.");
checkDependency("bw", "Error: bw (Bitwarden CLI) is not installed. Please install bw and try again.");
console.log("Dependencies OK")

// Fetch the token
console.log("Fetching tokens ...");
const token = fetchToken();
console.log("Got token")

// Spawn the server process with the token in the environment
console.log("Starting the server...");
const child = spawn("bun", ["run", "src/index.ts"], {
	env: { ...process.env, DISCORD_BOT_TOKEN: token },
	stdio: "inherit",
});

child.on("exit", (code) => {
	process.exit(code || 0);
});
