import { getSetting, setSetting } from "./email";

export interface OAuthConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	// Casdoor specific
	serverUrl?: string;
	// Microsoft specific
	tenant?: string;
}

export interface OAuthUserInfo {
	providerId: string;
	username: string;
	email?: string;
}

export type OAuthProvider = "casdoor" | "github" | "gitee" | "cloudflare" | "microsoft" | "google";

export const OAUTH_PROVIDERS: Record<OAuthProvider, { name: string; icon: string }> = {
	casdoor: { name: "Casdoor", icon: "🔐" },
	github: { name: "GitHub", icon: "🐙" },
	gitee: { name: "Gitee", icon: "🔷" },
	cloudflare: { name: "Cloudflare SSO", icon: "☁️" },
	microsoft: { name: "Microsoft", icon: "🪟" },
	google: { name: "Google", icon: "🔵" },
};

export async function getOAuthConfig(env: Env, provider: OAuthProvider, requestUrl: string): Promise<OAuthConfig | null> {
	const prefix = `oauth_${provider}`;
	const clientId = await getSetting(env, `${prefix}_client_id`);
	const clientSecret = await getSetting(env, `${prefix}_client_secret`);

	if (!clientId || !clientSecret) {
		return null;
	}

	const origin = new URL(requestUrl).origin;
	const redirectUri = await getSetting(env, `${prefix}_redirect_uri`) || `${origin}/api/auth/oauth/callback/${provider}`;

	const config: OAuthConfig = { clientId, clientSecret, redirectUri };

	if (provider === "casdoor") {
		config.serverUrl = await getSetting(env, "oauth_casdoor_server_url") || "";
	}
	if (provider === "microsoft") {
		config.tenant = await getSetting(env, "oauth_microsoft_tenant") || "common";
	}

	return config;
}

export function getAuthorizationUrl(provider: OAuthProvider, config: OAuthConfig, state: string): string {
	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		response_type: "code",
		state,
		scope: getDefaultScope(provider),
	});

	switch (provider) {
		case "github":
			return `https://github.com/login/oauth/authorize?${params.toString()}`;
		case "gitee":
			return `https://gitee.com/oauth/authorize?${params.toString()}`;
		case "google":
			return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
		case "microsoft":
			return `https://login.microsoftonline.com/${config.tenant || "common"}/oauth2/v2.0/authorize?${params.toString()}`;
		case "cloudflare":
			return `https://dash.cloudflare.com/oauth2/auth?${params.toString()}`;
		case "casdoor":
			const serverUrl = (config.serverUrl || "").replace(/\/$/, "");
			return `${serverUrl}/login/oauth/authorize?${params.toString()}`;
		default:
			throw new Error(`Unsupported provider: ${provider}`);
	}
}

export async function exchangeCodeForToken(provider: OAuthProvider, config: OAuthConfig, code: string): Promise<string> {
	const tokenUrl = getTokenUrl(provider, config);
	const params = new URLSearchParams({
		client_id: config.clientId,
		client_secret: config.clientSecret,
		code,
		redirect_uri: config.redirectUri,
		grant_type: "authorization_code",
	});

	const headers: Record<string, string> = {
		"Content-Type": "application/x-www-form-urlencoded",
	};

	if (provider === "github" || provider === "gitee") {
		headers["Accept"] = "application/json";
	}

	const res = await fetch(tokenUrl, {
		method: "POST",
		headers,
		body: params.toString(),
	});

	const data = (await res.json()) as Record<string, unknown>;

	if (!res.ok) {
		throw new Error(`Token exchange failed: ${(data as Record<string, string>).error_description || (data as Record<string, string>).error || "Unknown error"}`);
	}

	const accessToken = (data as Record<string, string>).access_token;
	if (!accessToken) {
		throw new Error(`Token exchange succeeded but no access_token returned. Response: ${JSON.stringify(data)}`);
	}

	return accessToken;
}

export async function fetchUserInfo(provider: OAuthProvider, accessToken: string, config?: OAuthConfig): Promise<OAuthUserInfo> {
	switch (provider) {
		case "github":
			return fetchGitHubUser(accessToken);
		case "gitee":
			return fetchGiteeUser(accessToken);
		case "google":
			return fetchGoogleUser(accessToken);
		case "microsoft":
			return fetchMicrosoftUser(accessToken);
		case "cloudflare":
			return fetchCloudflareUser(accessToken);
		case "casdoor":
			return fetchCasdoorUser(accessToken, config);
		default:
			throw new Error(`Unsupported provider: ${provider}`);
	}
}

function getDefaultScope(provider: OAuthProvider): string {
	switch (provider) {
		case "github":
			return "read:user user:email";
		case "gitee":
			return "user_info user:email";
		case "google":
			return "openid profile email";
		case "microsoft":
			return "openid profile email User.Read";
		case "cloudflare":
			return "openid profile email";
		case "casdoor":
			return "openid profile email";
		default:
			return "profile email";
	}
}

function getTokenUrl(provider: OAuthProvider, config: OAuthConfig): string {
	switch (provider) {
		case "github":
			return "https://github.com/login/oauth/access_token";
		case "gitee":
			return "https://gitee.com/oauth/token";
		case "google":
			return "https://oauth2.googleapis.com/token";
		case "microsoft":
			return `https://login.microsoftonline.com/${config.tenant || "common"}/oauth2/v2.0/token`;
		case "cloudflare":
			return "https://dash.cloudflare.com/oauth2/token";
		case "casdoor": {
			const serverUrl = (config.serverUrl || "").replace(/\/$/, "");
			return `${serverUrl}/api/login/oauth/access_token`;
		}
		default:
			throw new Error(`Unsupported provider: ${provider}`);
	}
}

async function fetchGitHubUser(accessToken: string): Promise<OAuthUserInfo> {
	const res = await fetch("https://api.github.com/user", {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.v3+json" },
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Failed to fetch GitHub user (HTTP ${res.status}): ${body}`);
	}
	const user = (await res.json()) as Record<string, unknown>;

	let email = (user.email as string) || null;
	if (!email) {
		const emailRes = await fetch("https://api.github.com/user/emails", {
			headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.v3+json" },
		});
		if (emailRes.ok) {
			const emails = (await emailRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
			const primary = emails.find((e) => e.primary && e.verified);
			if (primary) email = primary.email;
		}
	}

	return {
		providerId: String(user.id),
		username: (user.login as string) || `github_${user.id}`,
		email: email || undefined,
	};
}

async function fetchGiteeUser(accessToken: string): Promise<OAuthUserInfo> {
	const res = await fetch("https://gitee.com/api/v5/user", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) throw new Error("Failed to fetch Gitee user");
	const user = (await res.json()) as Record<string, unknown>;

	return {
		providerId: String(user.id),
		username: (user.login as string) || (user.name as string) || `gitee_${user.id}`,
		email: (user.email as string) || undefined,
	};
}

async function fetchGoogleUser(accessToken: string): Promise<OAuthUserInfo> {
	const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) throw new Error("Failed to fetch Google user");
	const user = (await res.json()) as Record<string, unknown>;

	return {
		providerId: String(user.id),
		username: (user.name as string) || `google_${user.id}`,
		email: (user.email as string) || undefined,
	};
}

async function fetchMicrosoftUser(accessToken: string): Promise<OAuthUserInfo> {
	const res = await fetch("https://graph.microsoft.com/v1.0/me", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) throw new Error("Failed to fetch Microsoft user");
	const user = (await res.json()) as Record<string, unknown>;

	return {
		providerId: String(user.id),
		username: (user.userPrincipalName as string) || (user.mail as string) || `ms_${user.id}`,
		email: (user.mail as string) || undefined,
	};
}

async function fetchCloudflareUser(accessToken: string): Promise<OAuthUserInfo> {
	const res = await fetch("https://dash.cloudflare.com/oauth2/userinfo", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) throw new Error("Failed to fetch Cloudflare user");
	const user = (await res.json()) as Record<string, unknown>;

	return {
		providerId: String(user.id),
		username: (user.email as string) || `cf_${user.id}`,
		email: (user.email as string) || undefined,
	};
}

async function fetchCasdoorUser(accessToken: string, config?: OAuthConfig): Promise<OAuthUserInfo> {
	const serverUrl = (config?.serverUrl || "").replace(/\/$/, "");
	const res = await fetch(`${serverUrl}/api/userinfo`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) throw new Error("Failed to fetch Casdoor user");
	const user = (await res.json()) as Record<string, unknown>;

	return {
		providerId: String(user.sub || user.id),
		username: (user.name as string) || (user.preferred_username as string) || `casdoor_${user.sub || user.id}`,
		email: (user.email as string) || undefined,
	};
}
