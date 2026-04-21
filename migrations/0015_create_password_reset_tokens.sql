CREATE TABLE IF NOT EXISTS password_reset_tokens (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL REFERENCES users(id),
	token TEXT NOT NULL UNIQUE,
	expires_at TEXT NOT NULL,
	created_at TEXT DEFAULT (datetime('now'))
);
