import type { HumanCheck } from '../index'

export function createStubHumanCheck(isHuman = true): HumanCheck {
	return { verify: async () => isHuman }
}
