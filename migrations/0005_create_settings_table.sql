CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('registration_enabled', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('smtp_host', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('smtp_port', '587');
INSERT OR IGNORE INTO settings (key, value) VALUES ('smtp_secure', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('smtp_user', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('smtp_pass', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('smtp_from', '');
