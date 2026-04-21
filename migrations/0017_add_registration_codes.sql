CREATE TABLE IF NOT EXISTS registration_verification_codes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	code TEXT NOT NULL,
	username TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
