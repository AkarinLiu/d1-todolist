CREATE TABLE password_reset_tokens (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	token TEXT NOT NULL UNIQUE,
	expires_at TEXT NOT NULL,
	created_at TEXT DEFAULT datetime('now'),
	FOREIGN KEY (user_id) REFERENCES users(id)
);
