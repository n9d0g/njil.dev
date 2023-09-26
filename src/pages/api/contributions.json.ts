import { parseHTML } from 'linkedom'

export async function GET() {
	const api =
		'https://github.com/users/n9d0g/contributions?from=2023-01-01&to=2023-12-30'
	const response = await fetch(api)
	const data = await response.text()

	const { document } = parseHTML(data)

	const rows: any = document.querySelectorAll('tbody > tr')

	// TODO: fix type
	const contributions: any = []

	for (const row of rows) {
		const days = row.querySelectorAll('td:not(.ContributionCalendar-label)')

		// TODO: fix type
		const currentRow: any = []

		for (const day of days) {
			const data = day.innerText.split(' ')

			if (data.length > 1) {
				const contribution = {
					count: data[0] === 'No' ? 0 : +data[0],
					name: data[3].replace(',', ''),
					month: data[4],
					day: +data[5].replace(',', ''),
					year: data[6],
					level: +day.dataset.level!,
				}

				currentRow.push(contribution)
			} else {
				currentRow.push(null)
			}
		}

		contributions.push(currentRow)
	}
	return new Response(
		JSON.stringify({
			contributions: contributions,
		})
	)
}
