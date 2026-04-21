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

export { sendEmail, getSetting, setSetting }
