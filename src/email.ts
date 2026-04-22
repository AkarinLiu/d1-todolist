import { WorkerMailer } from "worker-mailer"

async function sendEmail(to: string, subject: string, html: string, env: Env): Promise<{ success: boolean; error?: string }> {
	const smtpHost = await getSetting(env, "smtp_host")
	const smtpPortStr = await getSetting(env, "smtp_port")
	const smtpUser = await getSetting(env, "smtp_user")
	const smtpPass = await getSetting(env, "smtp_pass")
	const from = await getSetting(env, "smtp_from")

	if (!smtpHost || !smtpPortStr || !smtpUser || !smtpPass || !from) {
		return { success: false, error: "SMTP not configured" }
	}

	const smtpPort = parseInt(smtpPortStr, 10)
	if (isNaN(smtpPort)) {
		return { success: false, error: "Invalid SMTP port" }
	}

	let mailer: WorkerMailer | null = null
	try {
		mailer = await WorkerMailer.connect({
			host: smtpHost,
			port: smtpPort,
			secure: smtpPort === 465,
			credentials: { username: smtpUser, password: smtpPass },
			authType: "plain",
		})

		await mailer.send({ from, to, subject, html })
		return { success: true }
	} catch (err) {
		return { success: false, error: "Failed to send email via SMTP" }
	} finally {
		if (mailer) {
			try {
				await mailer.close()
			} catch {
				// ignore close errors
			}
		}
	}
}

async function getSetting(env: Env, key: string): Promise<string> {
	const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first() as Record<string, string> | null
	return row?.value ?? ""
}

async function setSetting(env: Env, key: string, value: string) {
	await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?").bind(key, value, value).run()
}

async function checkEmailRateLimit(ip: string, env: Env): Promise<Response | null> {
	const maxStr = await getSetting(env, "email_rate_limit_max")
	const windowStr = await getSetting(env, "email_rate_limit_window")
	const cooldownStr = await getSetting(env, "email_rate_limit_cooldown")

	const max = parseInt(maxStr, 10) || 3
	const windowMin = parseInt(windowStr, 10) || 10
	const cooldownHours = parseInt(cooldownStr, 10) || 24

	await env.DB.prepare("DELETE FROM email_rate_limit_blocks WHERE blocked_until <= datetime('now')").run()

	const block = await env.DB.prepare("SELECT blocked_until FROM email_rate_limit_blocks WHERE ip = ? AND blocked_until > datetime('now') ORDER BY blocked_until DESC LIMIT 1").bind(ip).first() as Record<string, string> | null
	if (block) {
		const blockedUntil = new Date(block.blocked_until + "Z").getTime()
		const retryAfter = Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000))
		return new Response(JSON.stringify({ error: "Too many email requests. Please try again later." }), {
			status: 429,
			headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) }
		})
	}

	await env.DB.prepare("DELETE FROM email_rate_limits WHERE ip = ? AND created_at <= datetime('now', ? || ' minutes')").bind(ip, -cooldownHours * 60).run()

	const countRow = await env.DB.prepare("SELECT COUNT(*) as cnt FROM email_rate_limits WHERE ip = ? AND created_at > datetime('now', ? || ' minutes')").bind(ip, -windowMin).first() as Record<string, number>
	if ((countRow?.cnt ?? 0) >= max) {
		const blockedUntil = new Date(Date.now() + cooldownHours * 3600 * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, "")
		await env.DB.prepare("DELETE FROM email_rate_limit_blocks WHERE ip = ?").bind(ip).run()
		await env.DB.prepare("INSERT INTO email_rate_limit_blocks (ip, blocked_until) VALUES (?, ?)").bind(ip, blockedUntil).run()
		const retryAfter = cooldownHours * 3600
		return new Response(JSON.stringify({ error: "Too many email requests. Please try again later." }), {
			status: 429,
			headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) }
		})
	}

	return null
}

async function recordEmailSend(ip: string, env: Env) {
	await env.DB.prepare("INSERT INTO email_rate_limits (ip) VALUES (?)").bind(ip).run()
}

function getClientIP(request: Request): string {
	return request.headers.get("CF-Connecting-IP") || "unknown"
}

export { sendEmail, getSetting, setSetting, checkEmailRateLimit, recordEmailSend, getClientIP }
