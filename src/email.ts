async function sendEmail(to: string, subject: string, html: string, env: Env): Promise<{ success: boolean; error?: string }> {
	const provider = await getSetting(env, "email_provider");
	const apiKey = await getSetting(env, "email_api_key");
	const from = await getSetting(env, "smtp_from");
	const smtpHost = await getSetting(env, "smtp_host");
	const smtpPort = await getSetting(env, "smtp_port");
	const smtpUser = await getSetting(env, "smtp_user");
	const smtpPass = await getSetting(env, "smtp_pass");

	if (!provider || !from) {
		return { success: false, error: "Email provider not configured" };
	}

	try {
		if (provider === "resend") {
			if (!apiKey) return { success: false, error: "Resend API Key is required" };
			const res = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ from, to, subject, html }),
			});
			const data = await res.json() as Record<string, unknown>;
			if (!res.ok) {
				return { success: false, error: (data as Record<string, string>).message || "Failed to send email" };
			}
			return { success: true };
		}

		if (provider === "sendgrid") {
			if (!apiKey) return { success: false, error: "SendGrid API Key is required" };
			const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					personalizations: [{ to: [{ email: to }] }],
					from: { email: from },
					subject,
					content: [{ type: "text/html", value: html }],
				}),
			});
			if (res.status !== 202) {
				const data = await res.json() as Record<string, unknown>;
				const errors = (data as Record<string, Array<{ message: string }>>).errors;
				return { success: false, error: errors?.[0]?.message || "Failed to send email" };
			}
			return { success: true };
		}

		if (provider === "brevo") {
			if (!apiKey) return { success: false, error: "Brevo API Key is required" };
			const res = await fetch("https://api.brevo.com/v3/smtp/email", {
				method: "POST",
				headers: {
					"api-key": apiKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					sender: { email: from },
					to: [{ email: to }],
					subject,
					htmlContent: html,
				}),
			});
			if (res.status !== 201) {
				const data = await res.json() as Record<string, unknown>;
				return { success: false, error: (data as Record<string, string>).message || "Failed to send email" };
			}
			return { success: true };
		}

		if (provider === "wecom") {
			return await sendWecomEmail(to, subject, html, env);
		}

		if (provider === "lark") {
			return await sendLarkEmail(to, subject, html, env);
		}

		if (provider === "custom_smtp") {
			if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
				return { success: false, error: "Please fill in all SMTP fields" };
			}
			return { success: false, error: "Cloudflare Workers cannot directly connect to SMTP servers. Please use an HTTP API provider (Resend, SendGrid, Brevo, WeCom) or configure a SMTP relay service." };
		}

		return { success: false, error: "Unsupported email provider" };
	} catch (err) {
		return { success: false, error: "Network error while sending email" };
	}
}

async function sendWecomEmail(to: string, subject: string, html: string, env: Env): Promise<{ success: boolean; error?: string }> {
	const accessToken = await getWecomAccessToken(env);
	if (!accessToken) {
		return { success: false, error: "Failed to get WeCom access token. Please check Corp ID and App Secret." };
	}

	const url = `https://qyapi.weixin.qq.com/cgi-bin/exmail/app/compose_send?access_token=${accessToken}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			to: { emails: [to] },
			subject,
			content: html,
		}),
	});

	const data = (await res.json()) as Record<string, unknown>;
	const errcode = (data as Record<string, number>).errcode ?? -1;
	const errmsg = (data as Record<string, string>).errmsg || "Unknown error";

	if (errcode === 0) {
		return { success: true };
	}

	if (errcode === 42001 || errcode === 40014) {
		await setSetting(env, "wecom_access_token", "");
		await setSetting(env, "wecom_token_expires_at", "");
		return { success: false, error: "WeCom access token expired, please retry" };
	}

	return { success: false, error: `WeCom API error (${errcode}): ${errmsg}` };
}

async function getWecomAccessToken(env: Env): Promise<string | null> {
	const cachedToken = await getSetting(env, "wecom_access_token");
	const expiresAt = await getSetting(env, "wecom_token_expires_at");

	if (cachedToken && expiresAt) {
		const expiresTime = new Date(expiresAt).getTime();
		if (Date.now() < expiresTime - 300000) {
			return cachedToken;
		}
	}

	const corpId = await getSetting(env, "wecom_corp_id");
	const appSecret = await getSetting(env, "wecom_app_secret");

	if (!corpId || !appSecret) {
		return null;
	}

	const res = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${appSecret}`);
	const data = (await res.json()) as Record<string, unknown>;

	if ((data as Record<string, number>).errcode === 0) {
		const token = (data as Record<string, string>).access_token;
		const expiresIn = (data as Record<string, number>).expires_in ?? 7200;
		const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
		await setSetting(env, "wecom_access_token", token);
		await setSetting(env, "wecom_token_expires_at", expiresAt);
		return token;
	}

	return null;
}

async function sendLarkEmail(to: string, subject: string, html: string, env: Env): Promise<{ success: boolean; error?: string }> {
	const accessToken = await getSetting(env, "lark_user_access_token");
	if (!accessToken) {
		return { success: false, error: "Lark User Access Token is required. Please configure it in settings." };
	}

	const userMailboxId = await getSetting(env, "lark_user_mailbox_id") || "me";
	const url = `https://open.feishu.cn/open-apis/mail/v1/user_mailboxes/${userMailboxId}/messages/send`;

	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${accessToken}`,
			"Content-Type": "application/json; charset=utf-8",
		},
		body: JSON.stringify({
			subject,
			to: [{ mail_address: to }],
			body_html: html,
			body_plain_text: html.replace(/<[^>]*>/g, ""),
		}),
	});

	const data = (await res.json()) as Record<string, unknown>;
	const code = (data as Record<string, number>).code ?? -1;
	const msg = (data as Record<string, string>).msg || "Unknown error";

	if (code === 0) {
		return { success: true };
	}

	return { success: false, error: `Lark API error (${code}): ${msg}` };
}

async function getSetting(env: Env, key: string): Promise<string> {
	const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first() as Record<string, string> | null;
	return row?.value ?? "";
}

async function setSetting(env: Env, key: string, value: string) {
	await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?").bind(key, value, value).run();
}

export { sendEmail, getSetting, setSetting };
