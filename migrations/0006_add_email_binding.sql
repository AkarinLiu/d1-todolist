ALTER TABLE users ADD COLUMN email TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS email_verification_codes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL REFERENCES users(id),
	email TEXT NOT NULL,
	code TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('email_verification_required', 'false');
