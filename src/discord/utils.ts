export interface DiceParseResult {
	dices: number[];
	mod: number;
}

export function parseDiceNotation(input: string): DiceParseResult {
	if (typeof input !== "string" || !input.trim()) {
		throw new Error("Input must be a non-empty string.");
	}

	let clean = input.toLowerCase().trim();
	clean = clean.replace(/\b(roll|dice|die)\b/g, "");
	clean = clean.replace(/\s+/g, "");

	const tokenRegex = /(\d*d\d+|[+\-]\d+)/g;
	const tokens = clean.match(tokenRegex);

	if (!tokens) {
		throw new Error(
			"Unable to parse any dice or modifiers. Examples: '3d6+5', 'd20-2', '2d8+1d6+4'.",
		);
	}

	const dice: number[] = [];
	let mod = 0;

	for (const token of tokens) {
		if (token.includes("d")) {
			const [countPart, sidesPart] = token.split("d");

			let diceCount = countPart ? Number.parseInt(countPart, 10) : 1;
			if (Number.isNaN(diceCount) || diceCount < 1) {
				diceCount = 1;
			}

			const sides = Number.parseInt(sidesPart, 10);
			if (Number.isNaN(sides) || sides <= 0) {
				throw new Error(`Invalid number of sides: "${sidesPart}"`);
			}

			for (let i = 0; i < diceCount; i++) {
				dice.push(sides);
			}
		} else {
			const parsedMod = Number.parseInt(token, 10);
			if (Number.isNaN(parsedMod)) {
				throw new Error(`Invalid modifier: "${token}"`);
			}
			mod += parsedMod;
		}
	}

	return { dices: dice, mod };
}
