CREATE TABLE IF NOT EXISTS oauth_users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL REFERENCES users(id),
	provider TEXT NOT NULL,
	provider_id TEXT NOT NULL,
	UNIQUE(provider, provider_id)
);
