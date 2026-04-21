import { renderHtml, renderAuthPage, renderPublicPage, renderAdminPage, renderSettingsPage, renderProfilePage, renderSetupPage, renderPasswordResetPage } from "./renderHtml";
import { hashPassword, verifyPassword, generateSessionToken } from "./auth";
import { sendEmail, getSetting, setSetting } from "./email";
import { getOAuthConfig, getAuthorizationUrl, exchangeCodeForToken, fetchUserInfo, OAUTH_PROVIDERS, OAuthProvider } from "./oauth";

async function getEnabledOAuthProviders(env: Env): Promise<Array<{ key: string; name: string; icon: string }>> {
	const providers: Array<{ key: string; name: string; icon: string }> = [];
	for (const [key, info] of Object.entries(OAUTH_PROVIDERS)) {
		const clientId = await getSetting(env, `oauth_${key}_client_id`);
		const clientSecret = await getSetting(env, `oauth_${key}_client_secret`);
		if (clientId && clientSecret) {
			providers.push({ key, name: info.name, icon: info.icon });
		}
	}
	return providers;
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;
		const sessionToken = getSessionToken(request);

		const user = sessionToken ? await getUserBySession(env, sessionToken) : null;

		if (path === "/" && method === "GET") {
			if (user) {
				return new Response(renderHtml(user.username, user.isAdmin), {
					headers: { "content-type": "text/html" },
				});
			}
			const userCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first() as Record<string, number>;
			const hasUsers = (userCount?.count ?? 0) > 0;
			const oauthProviders = await getEnabledOAuthProviders(env);
			if (!hasUsers && oauthProviders.length === 0) {
				return new Response(renderSetupPage(), {
					headers: { "content-type": "text/html" },
				});
			}
			return new Response(renderAuthPage(oauthProviders, env.TURNSTILE_SITE_KEY || ""), {
				headers: { "content-type": "text/html" },
			});
		}

		if (path === "/setup" && method === "GET") {
			const userCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first() as Record<string, number>;
			const hasUsers = (userCount?.count ?? 0) > 0;
			if (hasUsers) {
				return new Response("Setup already completed", { status: 403 });
			}
			return new Response(renderSetupPage(), {
				headers: { "content-type": "text/html" },
			});
		}

		if (path === "/admin" && method === "GET") {
			if (!user?.isAdmin) return new Response("Forbidden", { status: 403 });
			return new Response(renderAdminPage(user.username), {
				headers: { "content-type": "text/html" },
			});
		}

		if (path === "/admin/settings" && method === "GET") {
			if (!user?.isAdmin) return new Response("Forbidden", { status: 403 });
			return new Response(renderSettingsPage(user.username), {
				headers: { "content-type": "text/html" },
			});
		}

		if (path === "/profile" && method === "GET") {
			if (!user) return new Response("Unauthorized", { status: 401 });
			const profile = await env.DB.prepare("SELECT email, email_verified, password_hash FROM users WHERE id = ?").bind(user.id).first() as Record<string, string | number> | null;
			const hasPassword = typeof profile?.password_hash === "string" && (profile.password_hash as string).length > 0;
			return new Response(renderProfilePage(user.username, profile?.email as string | null, Number(profile?.email_verified) === 1, hasPassword), {
				headers: { "content-type": "text/html" },
			});
		}

		const publicMatch = path.match(/^\/public\/([^/]+)$/);
		if (publicMatch && method === "GET") {
			return new Response(renderPublicPage(publicMatch[1]), {
				headers: { "content-type": "text/html" },
			});
		}

		if (path === "/api/setup" && method === "POST") {
			return handleSetup(request, env);
		}

		if (path === "/api/auth/register/send-code" && method === "POST") {
			return handleRegisterSendCode(request, env);
		}

		if (path === "/api/auth/register/verify" && method === "POST") {
			return handleRegisterVerify(request, env);
		}

		if (path === "/api/auth/forgot-password" && method === "POST") {
			return handleForgotPassword(request, env);
		}

		if (path === "/api/auth/reset-password-by-code" && method === "POST") {
			return handleResetPasswordByCode(request, env);
		}

		if (path === "/api/auth/login" && method === "POST") {
			return handleLogin(request, env);
		}

		const oauthAuthorizeMatch = path.match(/^\/api\/auth\/oauth\/authorize\/([^/]+)$/);
		if (oauthAuthorizeMatch && method === "GET") {
			const isResetMode = url.searchParams.get("reset") === "true";
			return handleOAuthAuthorize(request, env, oauthAuthorizeMatch[1] as OAuthProvider, isResetMode);
		}

		const oauthCallbackMatch = path.match(/^\/api\/auth\/oauth\/callback\/([^/]+)$/);
		if (oauthCallbackMatch && method === "GET") {
			const isResetMode = url.searchParams.get("reset") === "true";
			return handleOAuthCallback(request, env, oauthCallbackMatch[1] as OAuthProvider, isResetMode);
		}

		if (path === "/reset-password" && method === "GET") {
			const token = url.searchParams.get("token");
			if (!token) {
				return new Response(renderAuthPage(await getEnabledOAuthProviders(env), env.TURNSTILE_SITE_KEY || ""), {
					headers: { "content-type": "text/html" },
				});
			}
			return new Response(renderPasswordResetPage(token), {
				headers: { "content-type": "text/html" },
			});
		}

		if (path === "/api/auth/change-password" && method === "POST") {
			return handleChangePassword(request, env, user?.id ?? 0);
		}

		if (path === "/api/auth/reset-password" && method === "POST") {
			return handlePasswordReset(request, env);
		}

		if (path === "/api/auth/reset-password/request" && method === "POST") {
			return handleRequestPasswordReset(request, env);
		}

		if (path === "/api/auth/logout" && method === "POST") {
			return handleLogout(env, sessionToken);
		}

		if (!user) {
			return jsonError("Unauthorized", 401);
		}

		if (path.startsWith("/api/admin") && !user.isAdmin) {
			return jsonError("Forbidden", 403);
		}

		if (path === "/api/admin/users" && method === "GET") {
			return handleGetUsers(env);
		}

		if (path === "/api/admin/users/delete" && method === "POST") {
			return handleDeleteUser(request, env);
		}

		if (path === "/api/admin/users/toggle-admin" && method === "PUT") {
			return handleToggleAdmin(request, env);
		}

		if (path === "/api/admin/settings" && method === "GET") {
			return handleGetSettings(env);
		}

		if (path === "/api/admin/settings" && method === "PUT") {
			return handleUpdateSettings(request, env);
		}

		if (path === "/api/admin/settings/smtp-test" && method === "POST") {
			return handleTestSmtp(request, env);
		}

		if (path === "/api/email/send-code" && method === "POST") {
			return handleSendEmailCode(request, env, user?.id ?? 0);
		}

		if (path === "/api/email/verify" && method === "POST") {
			return handleVerifyEmailCode(request, env, user?.id ?? 0);
		}

		if (path === "/api/todos") {
			if (method === "GET") {
				return handleGetTodos(env, user.id, url.searchParams);
			}
			if (method === "POST") {
				return handleCreateTodo(request, env, user.id);
			}
		}

		if (path === "/api/todos/toggle-public" && method === "PUT") {
			return handleTogglePublic(request, env, user.id);
		}

		const todoIdMatch = path.match(/^\/api\/todos\/(\d+)$/);
		if (todoIdMatch) {
			const id = parseInt(todoIdMatch[1], 10);
			if (method === "PUT") {
				return handleUpdateTodo(request, env, user.id, id);
			}
			if (method === "DELETE") {
				return handleDeleteTodo(env, user.id, id);
			}
		}

		const todoTagsMatch = path.match(/^\/api\/todos\/(\d+)\/tags$/);
		if (todoTagsMatch) {
			const todoId = parseInt(todoTagsMatch[1], 10);
			if (method === "GET") {
				return handleGetTodoTags(env, user.id, todoId);
			}
			if (method === "PUT") {
				return handleSetTodoTags(request, env, user.id, todoId);
			}
		}

		const todoStepsMatch = path.match(/^\/api\/todos\/(\d+)\/steps$/);
		if (todoStepsMatch) {
			const todoId = parseInt(todoStepsMatch[1], 10);
			if (method === "GET") {
				return handleGetSteps(env, user.id, todoId);
			}
			if (method === "POST") {
				return handleCreateStep(request, env, user.id, todoId);
			}
		}

		const stepIdMatch = path.match(/^\/api\/todos\/\d+\/steps\/(\d+)$/);
		if (stepIdMatch) {
			const stepId = parseInt(stepIdMatch[1], 10);
			if (method === "PUT") {
				return handleUpdateStep(request, env, user.id, stepId);
			}
			if (method === "DELETE") {
				return handleDeleteStep(env, user.id, stepId);
			}
		}

		if (path === "/api/tag-groups" && method === "GET") {
			return handleGetTagGroups(env, user.id);
		}
		if (path === "/api/tag-groups" && method === "POST") {
			return handleCreateTagGroup(request, env, user.id);
		}

		const tagGroupIdMatch = path.match(/^\/api\/tag-groups\/(\d+)$/);
		if (tagGroupIdMatch) {
			const id = parseInt(tagGroupIdMatch[1], 10);
			if (method === "PUT") {
				return handleUpdateTagGroup(request, env, user.id, id);
			}
			if (method === "DELETE") {
				return handleDeleteTagGroup(env, user.id, id);
			}
		}

		if (path === "/api/tags" && method === "GET") {
			return handleGetTags(env, user.id);
		}
		if (path === "/api/tags" && method === "POST") {
			return handleCreateTag(request, env, user.id);
		}

		const tagIdMatch = path.match(/^\/api\/tags\/(\d+)$/);
		if (tagIdMatch) {
			const id = parseInt(tagIdMatch[1], 10);
			if (method === "PUT") {
				return handleUpdateTag(request, env, user.id, id);
			}
			if (method === "DELETE") {
				return handleDeleteTag(env, user.id, id);
			}
		}

		if (path === "/api/public/todos" && method === "GET") {
			const username = url.searchParams.get("username");
			if (!username) return jsonError("Username required", 400);
			return handleGetPublicTodos(env, username);
		}

		if (path === "/api/public/tag-groups" && method === "GET") {
			const username = url.searchParams.get("username");
			if (!username) return jsonError("Username required", 400);
			return handleGetPublicTagGroups(env, username);
		}

		if (path === "/api/public/tags" && method === "GET") {
			const username = url.searchParams.get("username");
			if (!username) return jsonError("Username required", 400);
			return handleGetPublicTags(env, username);
		}

		if (path === "/api/public/todo-tags" && method === "GET") {
			const username = url.searchParams.get("username");
			const todoId = url.searchParams.get("todo_id");
			if (!username || !todoId) return jsonError("Username and todo_id required", 400);
			return handleGetPublicTodoTags(env, username, parseInt(todoId, 10));
		}

		return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;

function getSessionToken(request: Request): string | null {
	const cookie = request.headers.get("Cookie");
	if (!cookie) return null;
	const match = cookie.match(/session=([^;]+)/);
	return match ? match[1] : null;
}

async function getUserBySession(env: Env, token: string) {
	const row = await env.DB.prepare("SELECT id, username, is_admin FROM users WHERE session_token = ?").bind(token).first() as Record<string, string | number> | null;
	return row ? { id: Number(row.id), username: row.username as string, isAdmin: Number(row.is_admin) === 1 } : null;
}

async function handleSetup(request: Request, env: Env) {
	try {
		const userCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first() as Record<string, number>;
		if ((userCount?.count ?? 0) > 0) {
			return jsonError("Setup already completed", 403);
		}

		const body = await request.json<Record<string, string>>();

		const username = body.admin_username?.trim();
		const password = body.admin_password?.trim();
		if (username && password) {
			if (password.length < 6) {
				return jsonError("Password must be at least 6 characters", 400);
			}
			const passwordHash = await hashPassword(password);
			await env.DB.prepare("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)").bind(username, passwordHash, 1).run();
		}

		const providers = ["casdoor", "github", "gitee", "cloudflare", "microsoft", "google"];
		const extraFields: Record<string, string[]> = {
			casdoor: ["server_url"],
			microsoft: ["tenant"],
		};

		let configured = 0;
		for (const provider of providers) {
			const clientId = body[`oauth_${provider}_client_id`]?.trim();
			const clientSecret = body[`oauth_${provider}_client_secret`]?.trim();
			if (clientId && clientSecret) {
				await setSetting(env, `oauth_${provider}_client_id`, clientId);
				await setSetting(env, `oauth_${provider}_client_secret`, clientSecret);
				const redirectUri = body[`oauth_${provider}_redirect_uri`]?.trim();
				if (redirectUri) {
					await setSetting(env, `oauth_${provider}_redirect_uri`, redirectUri);
				}
				for (const field of (extraFields[provider] || [])) {
					const value = body[`oauth_${provider}_${field}`]?.trim();
					if (value) {
						await setSetting(env, `oauth_${provider}_${field}`, value);
					}
				}
				configured++;
			}
		}

		const hasLocalAdmin = username && password;
		if (!hasLocalAdmin && configured === 0) {
			return jsonError("Please create an admin account or configure at least one OAuth provider", 400);
		}

		return jsonResponse({ message: "Setup completed" });
	} catch (err) {
		return jsonError("Failed to setup", 500);
	}
}

async function handleRegisterSendCode(request: Request, env: Env) {
	try {
		const registrationEnabled = await getSetting(env, "registration_enabled");
		if (registrationEnabled !== "true") {
			return jsonError("Registration is disabled", 403);
		}

		const body = await request.json<{ username: string; password: string; email: string }>();
		if (!body.username?.trim() || !body.password?.trim() || !body.email?.trim()) {
			return jsonError("Username, password and email are required", 400);
		}
		if (body.password.length < 6) {
			return jsonError("Password must be at least 6 characters", 400);
		}
		if (!body.email.includes("@")) {
			return jsonError("Invalid email address", 400);
		}

		const existingUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(body.username.trim()).first();
		if (existingUser) {
			return jsonError("Username already exists", 409);
		}
		const existingEmail = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(body.email.trim()).first();
		if (existingEmail) {
			return jsonError("Email already in use", 409);
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
		const passwordHash = await hashPassword(body.password);

		await env.DB.prepare("DELETE FROM registration_verification_codes WHERE email = ?").bind(body.email.trim()).run();
		await env.DB.prepare("INSERT INTO registration_verification_codes (email, code, username, password_hash, expires_at) VALUES (?, ?, ?, ?, ?)").bind(body.email.trim(), code, body.username.trim(), passwordHash, expiresAt).run();

		const smtpHost = await getSetting(env, "smtp_host");
		const smtpPort = await getSetting(env, "smtp_port");
		const smtpUser = await getSetting(env, "smtp_user");
		const smtpPass = await getSetting(env, "smtp_pass");
		const from = await getSetting(env, "smtp_from");

		if (smtpHost && smtpPort && smtpUser && smtpPass && from) {
			const result = await sendEmail(body.email.trim(), "注册验证码", `<p>您的注册验证码是：<strong>${code}</strong></p><p>有效期10分钟。</p>`, env);
			if (!result.success) {
				return jsonResponse({ message: "Failed to send email", code });
			}
			return jsonResponse({ message: "Verification code sent to your email" });
		}

		return jsonResponse({ message: "SMTP not configured. For testing, your code is: " + code });
	} catch (err) {
		return jsonError("Failed to send registration code", 500);
	}
}

async function handleRegisterVerify(request: Request, env: Env) {
	try {
		const registrationEnabled = await getSetting(env, "registration_enabled");
		if (registrationEnabled !== "true") {
			return jsonError("Registration is disabled", 403);
		}

		const body = await request.json<{ email: string; code: string }>();
		if (!body.email?.trim() || !body.code?.trim()) {
			return jsonError("Email and code are required", 400);
		}

		const record = await env.DB.prepare(
			"SELECT username, password_hash FROM registration_verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
		).bind(body.email.trim(), body.code.trim()).first() as Record<string, string> | null;

		if (!record) {
			return jsonError("Invalid or expired verification code", 400);
		}

		const existingUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(record.username).first();
		if (existingUser) {
			return jsonError("Username already exists", 409);
		}

		await env.DB.prepare("INSERT INTO users (username, password_hash, email, email_verified, is_admin) VALUES (?, ?, ?, ?, ?)").bind(record.username, record.password_hash, body.email.trim(), 1, 0).run();
		await env.DB.prepare("DELETE FROM registration_verification_codes WHERE email = ?").bind(body.email.trim()).run();

		return jsonResponse({ message: "Registration successful" }, 201);
	} catch (err) {
		return jsonError("Failed to verify registration", 500);
	}
}

async function handleForgotPassword(request: Request, env: Env) {
	try {
		const body = await request.json<{ username: string }>();
		if (!body.username?.trim()) {
			return jsonError("Username is required", 400);
		}

		const user = await env.DB.prepare("SELECT id, email, email_verified FROM users WHERE username = ?").bind(body.username.trim()).first() as Record<string, string | number> | null;
		if (!user) {
			return jsonError("User not found", 404);
		}
		if (!user.email || Number(user.email_verified) !== 1) {
			return jsonError("No verified email bound to this account", 400);
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
		await env.DB.prepare("DELETE FROM password_reset_codes WHERE user_id = ?").bind(user.id).run();
		await env.DB.prepare("INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES (?, ?, ?)").bind(user.id, code, expiresAt).run();

		const smtpHost = await getSetting(env, "smtp_host");
		const smtpPort = await getSetting(env, "smtp_port");
		const smtpUser = await getSetting(env, "smtp_user");
		const smtpPass = await getSetting(env, "smtp_pass");
		const from = await getSetting(env, "smtp_from");

		if (smtpHost && smtpPort && smtpUser && smtpPass && from) {
			const result = await sendEmail(user.email as string, "密码重置验证码", `<p>您的密码重置验证码是：<strong>${code}</strong></p><p>有效期30分钟。</p>`, env);
			if (!result.success) {
				return jsonResponse({ message: "Failed to send email", code });
			}
			return jsonResponse({ message: "Verification code sent to your email" });
		}

		return jsonResponse({ message: "SMTP not configured. For testing, your code is: " + code });
	} catch (err) {
		return jsonError("Failed to request password reset", 500);
	}
}

async function handleResetPasswordByCode(request: Request, env: Env) {
	try {
		const body = await request.json<{ username: string; code: string; newPassword: string }>();
		if (!body.username?.trim() || !body.code?.trim() || !body.newPassword?.trim()) {
			return jsonError("Username, code and new password are required", 400);
		}
		if (body.newPassword.length < 6) {
			return jsonError("Password must be at least 6 characters", 400);
		}

		const user = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(body.username.trim()).first() as Record<string, number> | null;
		if (!user) {
			return jsonError("User not found", 404);
		}

		const record = await env.DB.prepare(
			"SELECT id FROM password_reset_codes WHERE user_id = ? AND code = ? AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
		).bind(user.id, body.code.trim()).first() as Record<string, number> | null;

		if (!record) {
			return jsonError("Invalid or expired verification code", 400);
		}

		const newPasswordHash = await hashPassword(body.newPassword);
		await env.DB.prepare("UPDATE users SET password_hash = ?, session_token = NULL WHERE id = ?").bind(newPasswordHash, user.id).run();
		await env.DB.prepare("DELETE FROM password_reset_codes WHERE user_id = ?").bind(user.id).run();

		return jsonResponse({ message: "Password reset successfully" });
	} catch (err) {
		return jsonError("Failed to reset password", 500);
	}
}

async function handleLogin(request: Request, env: Env) {
	try {
		const body = await request.json<{ username: string; password: string }>();
		if (!body.username?.trim() || !body.password?.trim()) {
			return jsonError("Username and password are required", 400);
		}
		const user = await env.DB.prepare("SELECT id, username, password_hash, is_admin, email, email_verified FROM users WHERE username = ?").bind(body.username.trim()).first() as Record<string, string | number> | null;
		if (!user || !(await verifyPassword(body.password, user.password_hash as string))) {
			return jsonError("Invalid username or password", 401);
		}
		const emailRequired = await getSetting(env, "email_verification_required");
		const requireEmailBind = emailRequired === "true" && (!user.email || Number(user.email_verified) !== 1);
		const sessionToken = generateSessionToken();
		await env.DB.prepare("UPDATE users SET session_token = ? WHERE id = ?").bind(sessionToken, user.id).run();
		return jsonResponse({ user: { id: Number(user.id), username: user.username, isAdmin: Number(user.is_admin) === 1 }, requireEmailBind }, 200, sessionToken);
	} catch (err) {
		return jsonError("Failed to login", 500);
	}
}

async function handleLogout(env: Env, sessionToken: string | null) {
	if (!sessionToken) return jsonError("Not logged in", 400);
	await env.DB.prepare("UPDATE users SET session_token = NULL WHERE session_token = ?").bind(sessionToken).run();
	return new Response(null, { status: 204, headers: { "Set-Cookie": "session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0" } });
}

async function handleOAuthAuthorize(request: Request, env: Env, provider: string, isResetMode: boolean) {
	const providerKey = provider as OAuthProvider;
	if (!OAUTH_PROVIDERS[providerKey]) {
		return jsonError("Unsupported OAuth provider", 400);
	}

	const config = await getOAuthConfig(env, providerKey, request.url);
	if (!config) {
		return jsonError(`OAuth provider ${provider} not configured. Please configure it in admin settings first.`, 400);
	}

	const state = generateSessionToken();
	const authUrl = getAuthorizationUrl(providerKey, config, state);

	const response = new Response(null, {
		status: 302,
		headers: {
			Location: authUrl,
			"Set-Cookie": `oauth_state=${state}${isResetMode ? ";reset=true" : ""}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 10}`,
		},
	});

	return response;
}

async function handleOAuthCallback(request: Request, env: Env, provider: string, isResetMode: boolean) {
	const providerKey = provider as OAuthProvider;
	if (!OAUTH_PROVIDERS[providerKey]) {
		return jsonError("Unsupported OAuth provider", 400);
	}

	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const error = url.searchParams.get("error");

	if (error) {
		const errorDesc = url.searchParams.get("error_description") || error;
		return new Response(renderOAuthError(errorDesc), { headers: { "content-type": "text/html" } });
	}

	if (!code || !state) {
		return new Response(renderOAuthError("Missing code or state parameter"), { headers: { "content-type": "text/html" } });
	}

	const cookie = request.headers.get("Cookie");
	const savedState = cookie?.match(/oauth_state=([^;]+)/)?.[1];
	const isResetCookie = cookie?.match(/oauth_state=[^;]+;reset=([^;]+)/)?.[1] === "true";
	const resetMode = isResetMode || isResetCookie;
	if (!savedState || savedState !== state) {
		return new Response(renderOAuthError("Invalid state parameter. Possible CSRF attack."), { headers: { "content-type": "text/html" } });
	}

	const config = await getOAuthConfig(env, providerKey, request.url);
	if (!config) {
		return new Response(renderOAuthError(`OAuth provider ${provider} not configured`), { headers: { "content-type": "text/html" } });
	}

	try {
		const accessToken = await exchangeCodeForToken(providerKey, config, code);
		const userInfo = await fetchUserInfo(providerKey, accessToken, config);

		const existingOAuth = await env.DB.prepare(
			"SELECT u.id, u.username, u.is_admin, u.email, u.email_verified FROM users u JOIN oauth_users o ON u.id = o.user_id WHERE o.provider = ? AND o.provider_id = ?"
		).bind(providerKey, userInfo.providerId).first() as Record<string, string | number> | null;

		if (existingOAuth) {
			if (resetMode) {
				const resetToken = generateSessionToken();
				const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
				await env.DB.prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)").bind(existingOAuth.id, resetToken, expiresAt).run();
				return new Response(null, {
					status: 302,
					headers: {
						Location: `/reset-password?token=${resetToken}`,
					},
				});
			}

			const sessionToken = generateSessionToken();
			await env.DB.prepare("UPDATE users SET session_token = ? WHERE id = ?").bind(sessionToken, existingOAuth.id).run();

			const emailRequired = await getSetting(env, "email_verification_required");
			if (emailRequired === "true" && (!existingOAuth.email || Number(existingOAuth.email_verified) !== 1)) {
				return new Response(null, {
					status: 302,
					headers: {
						Location: "/profile",
						"Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
					},
				});
			}

			return new Response(null, {
				status: 302,
				headers: {
					Location: "/",
					"Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
				},
			});
		}

		if (resetMode) {
			return new Response(renderOAuthError("User not found. Please login first before resetting password."), { headers: { "content-type": "text/html" } });
		}

		const userCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first() as Record<string, number>;
		const isAdmin = (userCount?.count ?? 0) === 0 ? 1 : 0;

		const username = userInfo.username || `${providerKey}_${userInfo.providerId}`;
		const existingUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();

		let userId: number;
		if (existingUser) {
			const uniqueUsername = `${username}_${userInfo.providerId.slice(-8)}`;
			await env.DB.prepare("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)").bind(uniqueUsername, "", isAdmin).run();
			const newUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(uniqueUsername).first() as Record<string, number>;
			userId = newUser.id;
		} else {
			await env.DB.prepare("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)").bind(username, "", isAdmin).run();
			const newUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first() as Record<string, number>;
			userId = newUser.id;
		}

		await env.DB.prepare("INSERT INTO oauth_users (user_id, provider, provider_id) VALUES (?, ?, ?)").bind(userId, providerKey, userInfo.providerId).run();

		if (userInfo.email) {
			await env.DB.prepare("UPDATE users SET email = ?, email_verified = 1 WHERE id = ?").bind(userInfo.email, userId).run();
		}

		const sessionToken = generateSessionToken();
		await env.DB.prepare("UPDATE users SET session_token = ? WHERE id = ?").bind(sessionToken, userId).run();

		const emailRequired = await getSetting(env, "email_verification_required");
		const newUserProfile = await env.DB.prepare("SELECT email, email_verified FROM users WHERE id = ?").bind(userId).first() as Record<string, string | number> | null;
		if (emailRequired === "true" && (!newUserProfile?.email || Number(newUserProfile?.email_verified) !== 1)) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/profile",
					"Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
				},
			});
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/",
				"Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
			},
		});
	} catch (err) {
		return new Response(renderOAuthError(`OAuth login failed: ${(err as Error).message}`), { headers: { "content-type": "text/html" } });
	}
}

async function handleChangePassword(request: Request, env: Env, userId: number) {
	try {
		const body = await request.json<{ currentPassword: string; newPassword: string }>();
		if (!body.currentPassword?.trim() || !body.newPassword?.trim()) {
			return jsonError("Current password and new password are required", 400);
		}
		if (body.newPassword.length < 6) {
			return jsonError("New password must be at least 6 characters", 400);
		}

		const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(userId).first() as Record<string, string> | null;
		if (!user) {
			return jsonError("User not found", 404);
		}

		if (!(await verifyPassword(body.currentPassword, user.password_hash))) {
			return jsonError("Current password is incorrect", 401);
		}

		const newPasswordHash = await hashPassword(body.newPassword);
		await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newPasswordHash, userId).run();

		return jsonResponse({ message: "Password changed successfully" });
	} catch (err) {
		return jsonError("Failed to change password", 500);
	}
}

async function verifyTurnstile(token: string, env: Env): Promise<boolean> {
	const secret = env.TURNSTILE_SECRET_KEY
	if (!secret) return true
	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ secret, response: token }),
	})
	const data = (await res.json()) as { success: boolean }
	return data.success
}

async function handleRequestPasswordReset(request: Request, env: Env) {
	try {
		const body = await request.json<{ username: string; provider: OAuthProvider; turnstileToken?: string }>()
		if (!body.username?.trim()) {
			return jsonError("Username is required", 400)
		}
		if (!body.provider || !OAUTH_PROVIDERS[body.provider]) {
			return jsonError("Valid OAuth provider is required", 400)
		}
		if (env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY) {
			if (!body.turnstileToken) {
				return jsonError("请完成人机验证", 400)
			}
			const verified = await verifyTurnstile(body.turnstileToken, env)
			if (!verified) {
				return jsonError("人机验证失败", 400)
			}
		}

		const user = await env.DB.prepare(
			"SELECT u.id FROM users u JOIN oauth_users o ON u.id = o.user_id WHERE u.username = ? AND o.provider = ?"
		).bind(body.username.trim(), body.provider).first() as Record<string, number> | null

		if (!user) {
			return jsonError("No OAuth account found for this username and provider", 404)
		}

		const resetToken = generateSessionToken()
		const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
		await env.DB.prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)").bind(user.id, resetToken, expiresAt).run()

		return jsonResponse({ token: resetToken, redirectUrl: `/reset-password?token=${resetToken}` })
	} catch (err) {
		return jsonError("Failed to request password reset", 500)
	}
}

async function handlePasswordReset(request: Request, env: Env) {
	try {
		const body = await request.json<{ token: string; newPassword: string }>();
		if (!body.token?.trim() || !body.newPassword?.trim()) {
			return jsonError("Token and new password are required", 400);
		}

		if (body.newPassword.length < 6) {
			return jsonError("Password must be at least 6 characters", 400);
		}

		const record = await env.DB.prepare(
			"SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
		).bind(body.token.trim()).first() as Record<string, number> | null;

		if (!record) {
			return jsonError("Invalid or expired reset token", 400);
		}

		const newPasswordHash = await hashPassword(body.newPassword);
		await env.DB.prepare("UPDATE users SET password_hash = ?, session_token = NULL WHERE id = ?").bind(newPasswordHash, record.user_id).run();
		await env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").bind(record.user_id).run();

		return jsonResponse({ message: "Password reset successfully. Please login with your new password." });
	} catch (err) {
		return jsonError("Failed to reset password", 500);
	}
}

function renderOAuthError(message: string): string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>OAuth 错误</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
		.error-container { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
		h1 { color: #ff4d4f; margin-bottom: 1rem; }
		p { color: #666; margin-bottom: 2rem; }
		a { display: inline-block; padding: 0.75rem 1.5rem; background: #0E838F; color: white; border-radius: 8px; text-decoration: none; }
	</style>
</head>
<body>
	<div class="error-container">
		<h1>OAuth 登录失败</h1>
		<p>${escapeHtml(message)}</p>
		<a href="/">返回登录页</a>
	</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function handleGetTodos(env: Env, userId: number, searchParams: URLSearchParams) {
	try {
		let query = "SELECT id, title, completed, is_public, created_at FROM todos WHERE owner_id = ?";
		const bindings: (string | number)[] = [userId];

		const tagId = searchParams.get("tag_id");
		const groupId = searchParams.get("group_id");

		if (tagId) {
			query += " AND id IN (SELECT todo_id FROM todo_tags WHERE tag_id = ?)";
			bindings.push(parseInt(tagId, 10));
		}
		if (groupId) {
			query += " AND id IN (SELECT tt.todo_id FROM todo_tags tt JOIN tags t ON tt.tag_id = t.id WHERE t.group_id = ?)";
			bindings.push(parseInt(groupId, 10));
		}

		query += " ORDER BY created_at DESC";

		const { results } = await env.DB.prepare(query).bind(...bindings).all();
		const todos = results as Array<Record<string, unknown>>;

		const todosWithTags = await Promise.all(todos.map(async (todo) => {
			const { results: tags } = await env.DB.prepare("SELECT t.id, t.name, t.color, t.group_id FROM tags t JOIN todo_tags tt ON t.id = tt.tag_id WHERE tt.todo_id = ?").bind(todo.id).all();
			return { ...todo, tags };
		}));

		return jsonResponse(todosWithTags);
	} catch (err) {
		return jsonError("Failed to fetch todos", 500);
	}
}

async function handleCreateTodo(request: Request, env: Env, userId: number) {
	try {
		const body = await request.json<{ title: string }>();
		if (!body.title?.trim()) {
			return jsonError("Title is required", 400);
		}
		const result = await env.DB.prepare("INSERT INTO todos (title, owner_id) VALUES (?, ?) RETURNING id, title, completed, is_public, created_at").bind(body.title.trim(), userId).first();
		return jsonResponse(result, 201);
	} catch (err) {
		return jsonError("Failed to create todo", 500);
	}
}

async function handleUpdateTodo(request: Request, env: Env, userId: number, id: number) {
	try {
		const body = await request.json<{ title?: string; completed?: boolean }>();
		const todo = await env.DB.prepare("SELECT * FROM todos WHERE id = ? AND owner_id = ?").bind(id, userId).first();
		if (!todo) {
			return jsonError("Todo not found", 404);
		}
		const newTitle = body.title ?? (todo as Record<string, unknown>).title;
		const newCompleted = body.completed !== undefined ? (body.completed ? 1 : 0) : (todo as Record<string, unknown>).completed;
		const updated = await env.DB.prepare("UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ? RETURNING id, title, completed, is_public, created_at").bind(newTitle, newCompleted, id, userId).first();
		return jsonResponse(updated);
	} catch (err) {
		return jsonError("Failed to update todo", 500);
	}
}

async function handleDeleteTodo(env: Env, userId: number, id: number) {
	try {
		const todo = await env.DB.prepare("SELECT * FROM todos WHERE id = ? AND owner_id = ?").bind(id, userId).first();
		if (!todo) {
			return jsonError("Todo not found", 404);
		}
		await env.DB.prepare("DELETE FROM todos WHERE id = ? AND owner_id = ?").bind(id, userId).run();
		return new Response(null, { status: 204 });
	} catch (err) {
		return jsonError("Failed to delete todo", 500);
	}
}

async function handleTogglePublic(request: Request, env: Env, userId: number) {
	try {
		const body = await request.json<{ id: number; isPublic: boolean }>();
		const todo = await env.DB.prepare("SELECT * FROM todos WHERE id = ? AND owner_id = ?").bind(body.id, userId).first();
		if (!todo) {
			return jsonError("Todo not found", 404);
		}
		const updated = await env.DB.prepare("UPDATE todos SET is_public = ? WHERE id = ? AND owner_id = ? RETURNING id, title, completed, is_public, created_at").bind(body.isPublic ? 1 : 0, body.id, userId).first();
		return jsonResponse(updated);
	} catch (err) {
		return jsonError("Failed to update visibility", 500);
	}
}

async function handleGetPublicTodos(env: Env, username: string) {
	try {
		const user = await env.DB.prepare("SELECT id, username FROM users WHERE username = ?").bind(username).first() as Record<string, string> | null;
		if (!user) {
			return jsonError("User not found", 404);
		}
		const { results } = await env.DB.prepare("SELECT id, title, completed, created_at FROM todos WHERE owner_id = ? AND is_public = 1 ORDER BY created_at DESC").bind(user.id).all();
		const todosWithSteps = await Promise.all((results as Array<Record<string, unknown>>).map(async (todo) => {
			const { results: steps } = await env.DB.prepare("SELECT id, title, completed, sort_order FROM todo_steps WHERE todo_id = ? ORDER BY sort_order ASC, created_at ASC").bind(todo.id).all();
			return { ...todo, steps };
		}));
		return jsonResponse({ username: user.username, todos: todosWithSteps });
	} catch (err) {
		return jsonError("Failed to fetch public todos", 500);
	}
}

async function handleGetPublicTagGroups(env: Env, username: string) {
	try {
		const user = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first() as Record<string, number> | null;
		if (!user) {
			return jsonError("User not found", 404);
		}
		const { results } = await env.DB.prepare("SELECT id, name, sort_order FROM tag_groups WHERE owner_id = ? AND is_public = 1 ORDER BY sort_order ASC, created_at ASC").bind(user.id).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch public tag groups", 500);
	}
}

async function handleGetPublicTags(env: Env, username: string) {
	try {
		const user = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first() as Record<string, number> | null;
		if (!user) {
			return jsonError("User not found", 404);
		}
		const { results } = await env.DB.prepare(`
			SELECT t.id, t.name, t.group_id, t.color 
			FROM tags t 
			WHERE t.owner_id = ? 
			AND (t.group_id IS NULL OR t.group_id IN (SELECT id FROM tag_groups WHERE owner_id = ? AND is_public = 1))
			ORDER BY t.created_at ASC
		`).bind(user.id, user.id).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch public tags", 500);
	}
}

async function handleGetPublicTodoTags(env: Env, username: string, todoId: number) {
	try {
		const user = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first() as Record<string, number> | null;
		if (!user) {
			return jsonError("User not found", 404);
		}
		const todo = await env.DB.prepare("SELECT id FROM todos WHERE id = ? AND owner_id = ? AND is_public = 1").bind(todoId, user.id).first();
		if (!todo) {
			return jsonError("Todo not found or not public", 404);
		}
		const { results } = await env.DB.prepare(`
			SELECT t.id, t.name, t.group_id, t.color 
			FROM tags t 
			JOIN todo_tags tt ON t.id = tt.tag_id 
			WHERE tt.todo_id = ?
			AND (t.group_id IS NULL OR t.group_id IN (SELECT id FROM tag_groups WHERE owner_id = ? AND is_public = 1))
		`).bind(todoId, user.id).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch todo tags", 500);
	}
}

async function handleGetSteps(env: Env, userId: number, todoId: number) {
	try {
		const todo = await env.DB.prepare("SELECT id FROM todos WHERE id = ? AND owner_id = ?").bind(todoId, userId).first();
		if (!todo) {
			return jsonError("Todo not found", 404);
		}
		const { results } = await env.DB.prepare("SELECT id, todo_id, title, completed, sort_order, created_at FROM todo_steps WHERE todo_id = ? ORDER BY sort_order ASC, created_at ASC").bind(todoId).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch steps", 500);
	}
}

async function handleCreateStep(request: Request, env: Env, userId: number, todoId: number) {
	try {
		const todo = await env.DB.prepare("SELECT id FROM todos WHERE id = ? AND owner_id = ?").bind(todoId, userId).first();
		if (!todo) {
			return jsonError("Todo not found", 404);
		}
		const body = await request.json<{ title: string }>();
		if (!body.title?.trim()) {
			return jsonError("Title is required", 400);
		}
		const maxOrder = await env.DB.prepare("SELECT COALESCE(MAX(sort_order), -1) as max_order FROM todo_steps WHERE todo_id = ?").bind(todoId).first() as Record<string, number>;
		const sortOrder = (maxOrder?.max_order ?? -1) + 1;
		const result = await env.DB.prepare("INSERT INTO todo_steps (todo_id, title, sort_order) VALUES (?, ?, ?) RETURNING id, todo_id, title, completed, sort_order, created_at").bind(todoId, body.title.trim(), sortOrder).first();
		return jsonResponse(result, 201);
	} catch (err) {
		return jsonError("Failed to create step", 500);
	}
}

async function handleUpdateStep(request: Request, env: Env, userId: number, stepId: number) {
	try {
		const step = await env.DB.prepare("SELECT ts.* FROM todo_steps ts JOIN todos t ON ts.todo_id = t.id WHERE ts.id = ? AND t.owner_id = ?").bind(stepId, userId).first() as Record<string, unknown> | null;
		if (!step) {
			return jsonError("Step not found", 404);
		}
		const body = await request.json<{ title?: string; completed?: boolean; sort_order?: number }>();
		const newTitle = body.title !== undefined ? body.title.trim() : step.title;
		const newCompleted = body.completed !== undefined ? (body.completed ? 1 : 0) : step.completed;
		const newSortOrder = body.sort_order !== undefined ? body.sort_order : step.sort_order;
		const updated = await env.DB.prepare("UPDATE todo_steps SET title = ?, completed = ?, sort_order = ? WHERE id = ? RETURNING id, todo_id, title, completed, sort_order, created_at").bind(newTitle, newCompleted, newSortOrder, stepId).first();
		return jsonResponse(updated);
	} catch (err) {
		return jsonError("Failed to update step", 500);
	}
}

async function handleDeleteStep(env: Env, userId: number, stepId: number) {
	try {
		const step = await env.DB.prepare("SELECT ts.* FROM todo_steps ts JOIN todos t ON ts.todo_id = t.id WHERE ts.id = ? AND t.owner_id = ?").bind(stepId, userId).first();
		if (!step) {
			return jsonError("Step not found", 404);
		}
		await env.DB.prepare("DELETE FROM todo_steps WHERE id = ?").bind(stepId).run();
		return new Response(null, { status: 204 });
	} catch (err) {
		return jsonError("Failed to delete step", 500);
	}
}

async function handleGetUsers(env: Env) {
	try {
		const { results } = await env.DB.prepare("SELECT id, username, is_admin, created_at FROM users ORDER BY created_at DESC").all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch users", 500);
	}
}

async function handleDeleteUser(request: Request, env: Env) {
	try {
		const body = await request.json<{ userId: number }>();
		const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(body.userId).first();
		if (!user) return jsonError("User not found", 404);
		await env.DB.prepare("DELETE FROM todos WHERE owner_id = ?").bind(body.userId).run();
		await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(body.userId).run();
		return jsonResponse({ message: "User deleted" });
	} catch (err) {
		return jsonError("Failed to delete user", 500);
	}
}

async function handleToggleAdmin(request: Request, env: Env) {
	try {
		const body = await request.json<{ userId: number }>();
		const user = await env.DB.prepare("SELECT is_admin FROM users WHERE id = ?").bind(body.userId).first() as Record<string, number> | null;
		if (!user) return jsonError("User not found", 404);
		const newAdmin = user.is_admin === 1 ? 0 : 1;
		await env.DB.prepare("UPDATE users SET is_admin = ? WHERE id = ?").bind(newAdmin, body.userId).run();
		return jsonResponse({ message: newAdmin === 1 ? "User is now admin" : "Admin removed" });
	} catch (err) {
		return jsonError("Failed to toggle admin", 500);
	}
}

async function handleGetSettings(env: Env) {
	try {
		const oauthProviders = ["casdoor", "github", "gitee", "cloudflare", "microsoft", "google"];
		const oauthFields = ["client_id", "client_secret", "redirect_uri"];
		const casdoorExtraFields = ["server_url"];
		const microsoftExtraFields = ["tenant"];

		const settings: Record<string, string> = {
			registration_enabled: await getSetting(env, "registration_enabled"),
			email_verification_required: await getSetting(env, "email_verification_required"),
			smtp_host: await getSetting(env, "smtp_host"),
			smtp_port: await getSetting(env, "smtp_port"),
			smtp_user: await getSetting(env, "smtp_user"),
			smtp_from: await getSetting(env, "smtp_from"),
			test_email_recipient: await getSetting(env, "test_email_recipient"),
		};

		for (const provider of oauthProviders) {
			for (const field of [...oauthFields, ...(provider === "casdoor" ? casdoorExtraFields : []), ...(provider === "microsoft" ? microsoftExtraFields : [])]) {
				settings[`oauth_${provider}_${field}`] = await getSetting(env, `oauth_${provider}_${field}`);
			}
		}

		return jsonResponse(settings);
	} catch (err) {
		return jsonError("Failed to fetch settings", 500);
	}
}

async function handleUpdateSettings(request: Request, env: Env) {
	try {
		const body = await request.json<Record<string, string>>();
		const oauthProviders = ["casdoor", "github", "gitee", "cloudflare", "microsoft", "google"];
		const oauthFields = ["client_id", "client_secret", "redirect_uri"];
		const casdoorExtraFields = ["server_url"];
		const microsoftExtraFields = ["tenant"];

		const allowedKeys = [
			"registration_enabled", "email_verification_required",
			"smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from", "test_email_recipient",
		];

		for (const provider of oauthProviders) {
			for (const field of [...oauthFields, ...(provider === "casdoor" ? casdoorExtraFields : []), ...(provider === "microsoft" ? microsoftExtraFields : [])]) {
				allowedKeys.push(`oauth_${provider}_${field}`);
			}
		}

		for (const key of allowedKeys) {
			if (body[key] !== undefined) {
				await setSetting(env, key, body[key]);
			}
		}
		return jsonResponse({ message: "Settings updated" });
	} catch (err) {
		return jsonError("Failed to update settings", 500);
	}
}

async function handleTestSmtp(request: Request, env: Env) {
	try {
		const smtpHost = await getSetting(env, "smtp_host");
		const smtpPort = await getSetting(env, "smtp_port");
		const smtpUser = await getSetting(env, "smtp_user");
		const smtpPass = await getSetting(env, "smtp_pass");
		const from = await getSetting(env, "smtp_from");
		const recipient = await getSetting(env, "test_email_recipient");

		if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !from) {
			return jsonError("Please fill in all SMTP fields", 400);
		}

		if (!recipient && !from) {
			return jsonError("Please fill in test recipient or sender address", 400);
		}

		const to = recipient || from;
		const result = await sendEmail(to, "测试邮件", "<p>这是一封来自待办事项应用的测试邮件。</p>", env);
		if (!result.success) {
			return jsonError(result.error || "Failed to send test email", 500);
		}
		return jsonResponse({ message: `Test email sent to ${to}` });
	} catch (err) {
		return jsonError("Failed to test email", 500);
	}
}

async function handleSendEmailCode(request: Request, env: Env, userId: number) {
	try {
		const body = await request.json<{ email: string }>();
		const email = body.email?.trim();
		if (!email || !email.includes("@")) {
			return jsonError("Invalid email address", 400);
		}
		const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? AND id != ?").bind(email, userId).first();
		if (existing) {
			return jsonError("Email already in use", 409);
		}
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
		await env.DB.prepare("INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES (?, ?, ?, ?)").bind(userId, email, code, expiresAt).run();
		const smtpHost = await getSetting(env, "smtp_host");
		const smtpPort = await getSetting(env, "smtp_port");
		const smtpUser = await getSetting(env, "smtp_user");
		const smtpPass = await getSetting(env, "smtp_pass");
		const from = await getSetting(env, "smtp_from");
		if (smtpHost && smtpPort && smtpUser && smtpPass && from) {
			const result = await sendEmail(email, "邮箱验证码", `<p>您的验证码是：<strong>${code}</strong></p><p>有效期10分钟。</p>`, env);
			if (!result.success) {
				return jsonError(result.error || "Failed to send email", 500);
			}
			return jsonResponse({ message: "Verification code sent to your email" });
		}
		return jsonResponse({ message: "SMTP not configured. For testing, your code is: " + code });
	} catch (err) {
		return jsonError("Failed to send verification code", 500);
	}
}

async function handleVerifyEmailCode(request: Request, env: Env, userId: number) {
	try {
		const body = await request.json<{ email: string; code: string }>();
		if (!body.email?.trim() || !body.code?.trim()) {
			return jsonError("Email and code are required", 400);
		}
		const record = await env.DB.prepare("SELECT * FROM email_verification_codes WHERE user_id = ? AND email = ? AND code = ? AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1").bind(userId, body.email.trim(), body.code.trim()).first();
		if (!record) {
			return jsonError("Invalid or expired verification code", 400);
		}
		await env.DB.prepare("UPDATE users SET email = ?, email_verified = 1 WHERE id = ?").bind(body.email.trim(), userId).run();
		await env.DB.prepare("DELETE FROM email_verification_codes WHERE user_id = ?").bind(userId).run();
		return jsonResponse({ message: "Email verified successfully" });
	} catch (err) {
		return jsonError("Failed to verify email", 500);
	}
}

async function handleGetTagGroups(env: Env, userId: number) {
	try {
		const { results } = await env.DB.prepare("SELECT id, name, sort_order, is_public, created_at FROM tag_groups WHERE owner_id = ? ORDER BY sort_order ASC, created_at ASC").bind(userId).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch tag groups", 500);
	}
}

async function handleCreateTagGroup(request: Request, env: Env, userId: number) {
	try {
		const body = await request.json<{ name: string; sort_order?: number; is_public?: boolean }>();
		if (!body.name?.trim()) {
			return jsonError("Name is required", 400);
		}
		const maxOrder = await env.DB.prepare("SELECT COALESCE(MAX(sort_order), -1) as max_order FROM tag_groups WHERE owner_id = ?").bind(userId).first() as Record<string, number>;
		const sortOrder = body.sort_order ?? (maxOrder?.max_order ?? -1) + 1;
		const isPublic = body.is_public ? 1 : 0;
		const result = await env.DB.prepare("INSERT INTO tag_groups (name, owner_id, sort_order, is_public) VALUES (?, ?, ?, ?) RETURNING id, name, sort_order, is_public, created_at").bind(body.name.trim(), userId, sortOrder, isPublic).first();
		return jsonResponse(result, 201);
	} catch (err) {
		return jsonError("Failed to create tag group", 500);
	}
}

async function handleUpdateTagGroup(request: Request, env: Env, userId: number, id: number) {
	try {
		const group = await env.DB.prepare("SELECT * FROM tag_groups WHERE id = ? AND owner_id = ?").bind(id, userId).first();
		if (!group) {
			return jsonError("Tag group not found", 404);
		}
		const body = await request.json<{ name?: string; sort_order?: number; is_public?: boolean }>();
		const existing = group as Record<string, unknown>;
		const newName = body.name !== undefined ? body.name.trim() : existing.name;
		const newSortOrder = body.sort_order !== undefined ? body.sort_order : existing.sort_order;
		const newIsPublic = body.is_public !== undefined ? (body.is_public ? 1 : 0) : existing.is_public;
		const updated = await env.DB.prepare("UPDATE tag_groups SET name = ?, sort_order = ?, is_public = ? WHERE id = ? AND owner_id = ? RETURNING id, name, sort_order, is_public, created_at").bind(newName, newSortOrder, newIsPublic, id, userId).first();
		return jsonResponse(updated);
	} catch (err) {
		return jsonError("Failed to update tag group", 500);
	}
}

async function handleDeleteTagGroup(env: Env, userId: number, id: number) {
	try {
		const group = await env.DB.prepare("SELECT * FROM tag_groups WHERE id = ? AND owner_id = ?").bind(id, userId).first();
		if (!group) {
			return jsonError("Tag group not found", 404);
		}
		await env.DB.prepare("DELETE FROM tag_groups WHERE id = ? AND owner_id = ?").bind(id, userId).run();
		return new Response(null, { status: 204 });
	} catch (err) {
		return jsonError("Failed to delete tag group", 500);
	}
}

async function handleGetTags(env: Env, userId: number) {
	try {
		const { results } = await env.DB.prepare("SELECT id, name, group_id, color, created_at FROM tags WHERE owner_id = ? ORDER BY created_at ASC").bind(userId).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch tags", 500);
	}
}

async function handleCreateTag(request: Request, env: Env, userId: number) {
	try {
		const body = await request.json<{ name: string; group_id?: number | null; color?: string }>();
		if (!body.name?.trim()) {
			return jsonError("Name is required", 400);
		}
		const color = body.color || "#0E838F";
		const groupId = body.group_id ?? null;
		if (groupId) {
			const group = await env.DB.prepare("SELECT id FROM tag_groups WHERE id = ? AND owner_id = ?").bind(groupId, userId).first();
			if (!group) {
				return jsonError("Tag group not found", 404);
			}
		}
		const result = await env.DB.prepare("INSERT INTO tags (name, group_id, owner_id, color) VALUES (?, ?, ?, ?) RETURNING id, name, group_id, color, created_at").bind(body.name.trim(), groupId, userId, color).first();
		return jsonResponse(result, 201);
	} catch (err) {
		return jsonError("Failed to create tag", 500);
	}
}

async function handleUpdateTag(request: Request, env: Env, userId: number, id: number) {
	try {
		const tag = await env.DB.prepare("SELECT * FROM tags WHERE id = ? AND owner_id = ?").bind(id, userId).first();
		if (!tag) {
			return jsonError("Tag not found", 404);
		}
		const body = await request.json<{ name?: string; group_id?: number | null; color?: string }>();
		const existing = tag as Record<string, unknown>;
		const newName = body.name !== undefined ? body.name.trim() : existing.name;
		const newGroupId = body.group_id !== undefined ? body.group_id : existing.group_id;
		const newColor = body.color !== undefined ? body.color : existing.color;
		if (newGroupId) {
			const group = await env.DB.prepare("SELECT id FROM tag_groups WHERE id = ? AND owner_id = ?").bind(newGroupId, userId).first();
			if (!group) {
				return jsonError("Tag group not found", 404);
			}
		}
		const updated = await env.DB.prepare("UPDATE tags SET name = ?, group_id = ?, color = ? WHERE id = ? AND owner_id = ? RETURNING id, name, group_id, color, created_at").bind(newName, newGroupId, newColor, id, userId).first();
		return jsonResponse(updated);
	} catch (err) {
		return jsonError("Failed to update tag", 500);
	}
}

async function handleDeleteTag(env: Env, userId: number, id: number) {
	try {
		const tag = await env.DB.prepare("SELECT * FROM tags WHERE id = ? AND owner_id = ?").bind(id, userId).first();
		if (!tag) {
			return jsonError("Tag not found", 404);
		}
		await env.DB.prepare("DELETE FROM tags WHERE id = ? AND owner_id = ?").bind(id, userId).run();
		return new Response(null, { status: 204 });
	} catch (err) {
		return jsonError("Failed to delete tag", 500);
	}
}

async function handleGetTodoTags(env: Env, userId: number, todoId: number) {
	try {
		const todo = await env.DB.prepare("SELECT id FROM todos WHERE id = ? AND owner_id = ?").bind(todoId, userId).first();
		if (!todo) {
			return jsonError("Todo not found", 404);
		}
		const { results } = await env.DB.prepare("SELECT t.id, t.name, t.group_id, t.color FROM tags t JOIN todo_tags tt ON t.id = tt.tag_id WHERE tt.todo_id = ?").bind(todoId).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to fetch todo tags", 500);
	}
}

async function handleSetTodoTags(request: Request, env: Env, userId: number, todoId: number) {
	try {
		const todo = await env.DB.prepare("SELECT id FROM todos WHERE id = ? AND owner_id = ?").bind(todoId, userId).first();
		if (!todo) {
			return jsonError("Todo not found", 404);
		}
		const body = await request.json<{ tag_ids: number[] }>();
		if (!Array.isArray(body.tag_ids)) {
			return jsonError("tag_ids must be an array", 400);
		}
		for (const tagId of body.tag_ids) {
			const tag = await env.DB.prepare("SELECT id FROM tags WHERE id = ? AND owner_id = ?").bind(tagId, userId).first();
			if (!tag) {
				return jsonError(`Tag ${tagId} not found`, 404);
			}
		}
		await env.DB.prepare("DELETE FROM todo_tags WHERE todo_id = ?").bind(todoId).run();
		for (const tagId of body.tag_ids) {
			await env.DB.prepare("INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)").bind(todoId, tagId).run();
		}
		const { results } = await env.DB.prepare("SELECT t.id, t.name, t.group_id, t.color FROM tags t JOIN todo_tags tt ON t.id = tt.tag_id WHERE tt.todo_id = ?").bind(todoId).all();
		return jsonResponse(results);
	} catch (err) {
		return jsonError("Failed to set todo tags", 500);
	}
}

function jsonResponse(data: unknown, status = 200, sessionToken?: string) {
	const headers: Record<string, string> = { "content-type": "application/json" };
	if (sessionToken) {
		headers["Set-Cookie"] = `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`;
	}
	return new Response(JSON.stringify(data), { status, headers });
}

function jsonResponseWithRedirect(data: unknown, status = 200, sessionToken?: string, redirectUrl?: string) {
	const headers: Record<string, string> = { "content-type": "application/json" };
	if (sessionToken) {
		headers["Set-Cookie"] = `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`;
	}
	if (redirectUrl) {
		headers["X-Redirect-Url"] = redirectUrl;
	}
	return new Response(JSON.stringify(data), { status, headers });
}

function jsonError(message: string, status = 500) {
	return jsonResponse({ error: message }, status);
}
