async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const data = encoder.encode(password);
	const combined = new Uint8Array([...salt, ...data]);
	const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
	return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltHex, hashHex] = storedHash.split(":");
	const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const combined = new Uint8Array([...salt, ...data]);
	const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return computedHash === hashHex;
}

function generateSessionToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export { hashPassword, verifyPassword, generateSessionToken };
