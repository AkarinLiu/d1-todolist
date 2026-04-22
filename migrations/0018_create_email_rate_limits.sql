CREATE TABLE email_rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_rate_limits_ip_created ON email_rate_limits(ip, created_at);

CREATE TABLE email_rate_limit_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    blocked_until DATETIME NOT NULL
);
CREATE INDEX idx_email_rate_limit_blocks_ip ON email_rate_limit_blocks(ip);