export const Dice = {
	Four: 4,
	Six: 6,
	Ten: 10,
	Twelve: 12,
	Twenty: 20,
	Hundrer: 100,
};

export enum Critical {
	Fail = "fail",
	Success = "success",
}

type User = {
	Username: string;
};

export class DiceRoller {
	private username: string;
	constructor(user: string) {
		this.username = user;
	}

	public async roll(
		dice: (typeof Dice)[keyof typeof Dice],
		mod: number,
	): Promise<{ result: number; message?: string }> {
		if (!Object.values(Dice).includes(dice))
			throw new Error(`Invalid dice type: ${dice}`);

		const { result, crit } = this.getOutcome(dice, mod);

		if (crit.failure || crit.success) {
			return {
				result,
				message: crit.success
					? await this.handleCritical(Critical.Success)
					: await this.handleCritical(Critical.Fail),
			};
		}
		return { result };
	}

	private getOutcome(
		dice: (typeof Dice)[keyof typeof Dice],
		mod: number,
	): { result: number; crit: { failure: boolean; success: boolean } } {
		const roll = Math.floor(Math.random() * dice) + 1;
		return {
			result: roll + mod,
			crit: { failure: roll === 1, success: roll === 20 },
		};
	}

	private async handleCritical(critical: Critical): Promise<string> {
		switch (critical) {
			case Critical.Fail:
				return "crit!";
			case Critical.Success:
				return "fail!";
		}
	}
}
