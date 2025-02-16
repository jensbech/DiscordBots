interface DiceRollResult {
	base: number;
	mod: number;
}

export function parseDiceNotation(input: string): DiceRollResult {
	if (!input || typeof input !== "string") {
		throw new Error("Input must be a non-empty string.");
	}
	let cleaned = input.toLowerCase().trim();
	cleaned = cleaned.replace(/\b(roll|dice|die)\b/g, "");
	cleaned = cleaned.replace(/\s+/g, "");
	const diceRegex = /^(\d*)d(\d+)([+\-]\d+)?$/;
	const match = cleaned.match(diceRegex);
	if (!match) {
		throw new Error(
			"Unable to parse dice notation. Please use a format like 'd20', '2d10', or 'd12+4'.",
		);
	}
	const count = match[1] ? Number.parseInt(match[1], 10) : 1;
	const sides = Number.parseInt(match[2], 10);
	const mod = match[3] ? Number.parseInt(match[3], 10) : 0;
	if (Number.isNaN(count) || count <= 0) {
		throw new Error("Dice count must be a positive integer.");
	}
	if (Number.isNaN(sides) || sides <= 0) {
		throw new Error("Number of sides must be a positive integer.");
	}
	const base = sides;
	return { base, mod };
}
