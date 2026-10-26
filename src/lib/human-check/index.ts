export interface HumanCheck {
	verify(token: string): Promise<boolean>
}
