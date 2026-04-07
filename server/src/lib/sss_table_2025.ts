export type SSSRowInput = {
	salary_range_from: number;
	salary_range_to: number;
	msc_ss: number;
	msc_mpf: number;
	er_ss: number;
	er_mpf: number;
	er_ec: number;
	ee_ss: number;
	ee_mpf: number;
};

const roundToMoney = (value: number) => Number(value.toFixed(2));

const buildRow = ({
	salary_range_from,
	salary_range_to,
	msc_ss,
	msc_mpf,
	er_ec,
}: {
	salary_range_from: number;
	salary_range_to: number;
	msc_ss: number;
	msc_mpf: number;
	er_ec: number;
}): SSSRowInput => {
	const er_ss = roundToMoney(msc_ss * 0.1);
	const ee_ss = roundToMoney(msc_ss * 0.05);
	const er_mpf = roundToMoney(msc_mpf * 0.1);
	const ee_mpf = roundToMoney(msc_mpf * 0.05);

	return {
		salary_range_from: roundToMoney(salary_range_from),
		salary_range_to: roundToMoney(salary_range_to),
		msc_ss: roundToMoney(msc_ss),
		msc_mpf: roundToMoney(msc_mpf),
		er_ss,
		er_mpf,
		er_ec: roundToMoney(er_ec),
		ee_ss,
		ee_mpf,
	};
};

export const generateSSS2025TableSet = (): SSSRowInput[] => {
	const rows: SSSRowInput[] = [];

	for (let step = 0; step <= 30; step += 1) {
		const msc_ss = 5000 + step * 500;
		const salary_range_from = step === 0 ? 0 : 5250 + (step - 1) * 500;
		const salary_range_to = step === 0 ? 5249.99 : salary_range_from + 499.99;
		const er_ec = msc_ss < 15000 ? 10 : 30;

		rows.push(
			buildRow({
				salary_range_from,
				salary_range_to,
				msc_ss,
				msc_mpf: 0,
				er_ec,
			}),
		);
	}

	for (let step = 1; step <= 30; step += 1) {
		const salary_range_from = 20250 + (step - 1) * 500;
		const salary_range_to = step === 30 ? 999999.99 : salary_range_from + 499.99;

		rows.push(
			buildRow({
				salary_range_from,
				salary_range_to,
				msc_ss: 20000,
				msc_mpf: step * 500,
				er_ec: 30,
			}),
		);
	}

	return rows;
};
