export const Dice = {
	Four: 4,
	Six: 6,
	Ten: 10,
	Twelve: 12,
	Twenty: 20,
	Hundrer: 100,
} as const;

type User = {
	Username: string;
};

export class DiceRoller {
	private user: User;
	constructor(user: User) {
		this.user = user;
	}

	public async roll(
		dice: (typeof Dice)[keyof typeof Dice],
		mod: number,
	): Promise<{ result: number; message?: string }> {
		if (!Object.values(Dice).includes(dice))
			throw new Error(`Invalid dice type: ${dice}`);

		const { result, special } = this.getOutcome(dice, mod);

		if (special.fail || special.crit) {
			return { result, message: await this.handleSpecial(special) };
		}

		//
		return { result };
	}

	private getOutcome(
		dice: (typeof Dice)[keyof typeof Dice],
		mod: number,
	): { result: number; special: { fail: boolean; crit: boolean } } {
		const roll = Math.floor(Math.random() * dice) + 1;
		return {
			result: roll + mod,
			special: { fail: roll === 1, crit: roll === 20 },
		};
	}

	private async handleSpecial(special: {
		crit: number;
		fail: number;
	}): Promise<string> {
		return "";
	}
}
