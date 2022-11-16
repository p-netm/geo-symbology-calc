export const generateKey = (baseUrl: string, regId: string, visitId: string) =>
	`${baseUrl}-${regId}-${visitId}`;
