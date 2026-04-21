export function renderHtml(username: string, isAdmin: boolean) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>待办事项 - ${username}</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; padding: 2rem; }
		.container { max-width: 600px; margin: 0 auto; }
		.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
		h1 { color: #333; font-size: 2rem; }
		.user-info { display: flex; align-items: center; gap: 1rem; }
		.username { color: #0E838F; font-weight: 600; }
		.profile-btn { padding: 0.5rem 1rem; background: #2196f3; color: white; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.875rem; }
		.profile-btn:hover { background: #1976d2; }
		.admin-btn { padding: 0.5rem 1rem; background: #ff9800; color: white; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.875rem; }
		.admin-btn:hover { background: #e68900; }
		.logout-btn { padding: 0.5rem 1rem; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
		.logout-btn:hover { background: #555; }
		.input-group { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
		.input-group input { flex: 1; padding: 0.75rem 1rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
		.input-group input:focus { outline: none; border-color: #0E838F; }
		.input-group button { padding: 0.75rem 1.5rem; background: #0E838F; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
		.input-group button:hover { background: #0b6b6b; }
		.todo-list { list-style: none; }
		.todo-item { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: white; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s; }
		.todo-item:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
		.todo-item.completed .todo-title { text-decoration: line-through; color: #999; }
		.todo-item input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; accent-color: #0E838F; }
		.todo-title { flex: 1; font-size: 1rem; color: #333; }
		.todo-actions { display: flex; gap: 0.5rem; align-items: center; }
		.public-toggle { padding: 0.3rem 0.6rem; background: #e8e8e8; color: #666; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
		.public-toggle.active { background: #0E838F; color: white; }
		.delete-btn { padding: 0.4rem 0.8rem; background: #ff4d4f; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; transition: background 0.2s; }
		.delete-btn:hover { background: #d9363e; }
		.steps-btn { padding: 0.3rem 0.6rem; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
		.steps-btn:hover { background: #7b1fa2; }
		.steps-container { margin-top: 0.5rem; padding: 0.75rem; background: #f9f9f9; border-radius: 6px; border-left: 3px solid #9c27b0; }
		.steps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
		.steps-header h4 { color: #9c27b0; font-size: 0.875rem; }
		.step-add { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
		.step-add input { flex: 1; padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem; }
		.step-add button { padding: 0.4rem 0.8rem; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
		.step-list { list-style: none; }
		.step-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; }
		.step-item input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: #9c27b0; }
		.step-item.completed .step-title { text-decoration: line-through; color: #999; }
		.step-title { flex: 1; font-size: 0.875rem; }
		.step-delete { padding: 0.2rem 0.5rem; background: #ff4d4f; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem; }
		.step-delete:hover { background: #d9363e; }
		.share-link { margin-top: 1.5rem; padding: 1rem; background: #e8f8f8; border-radius: 8px; text-align: center; }
		.share-link code { background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; }
		.empty-state { text-align: center; color: #999; padding: 3rem 0; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>待办事项</h1>
			<div class="user-info">
				<span class="username">${escapeHtml(username)}</span>
				<a class="profile-btn" href="/profile">个人资料</a>
				${isAdmin ? '<a class="admin-btn" href="/admin">管理用户</a>' : ''}
				<button class="logout-btn" onclick="logout()">退出登录</button>
			</div>
		</div>
		<form class="input-group" id="addForm">
			<input type="text" id="todoInput" placeholder="输入新的待办事项..." required />
			<button type="submit">添加</button>
		</form>
		<ul class="todo-list" id="todoList"></ul>
		<div class="share-link">
			<p>公开分享链接：<code id="shareUrl"></code></p>
		</div>
	</div>
	<script>
		const username = "${escapeHtml(username)}";
		const todoList = document.getElementById("todoList");
		const todoInput = document.getElementById("todoInput");
		const addForm = document.getElementById("addForm");
		const shareUrl = document.getElementById("shareUrl");

		shareUrl.textContent = window.location.origin + "/public/" + username;

		async function fetchTodos() {
			const res = await fetch("/api/todos");
			if (res.status === 401) { window.location.href = "/"; return; }
			const todos = await res.json();
			renderTodos(todos);
		}

		function renderTodos(todos) {
			if (todos.length === 0) {
				todoList.innerHTML = '<li class="empty-state">暂无待办事项，添加一个吧！</li>';
				return;
			}
			todoList.innerHTML = todos.map(todo => \`
				<li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
					<input type="checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${todo.id}, this.checked)" />
					<span class="todo-title">\${escapeHtml(todo.title)}</span>
					<div class="todo-actions">
						<button class="steps-btn" onclick="toggleSteps(\${todo.id})">步骤</button>
						<button class="public-toggle \${todo.is_public ? 'active' : ''}" onclick="togglePublic(\${todo.id}, \${todo.is_public})">\${todo.is_public ? '公开' : '私有'}</button>
						<button class="delete-btn" onclick="deleteTodo(\${todo.id})">删除</button>
					</div>
					<div class="steps-container" id="steps-\${todo.id}" style="display: none;">
						<div class="steps-header">
							<h4>步骤</h4>
						</div>
						<div class="step-add">
							<input type="text" id="stepInput-\${todo.id}" placeholder="添加步骤..." />
							<button onclick="addStep(\${todo.id})">添加</button>
						</div>
						<ul class="step-list" id="stepList-\${todo.id}"></ul>
					</div>
				</li>
			\`).join("");
		}

		function escapeHtml(text) {
			const div = document.createElement("div");
			div.textContent = text;
			return div.innerHTML;
		}

		addForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const title = todoInput.value.trim();
			if (!title) return;
			await fetch("/api/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
			todoInput.value = "";
			fetchTodos();
		});

		window.toggleTodo = async (id, completed) => {
			await fetch(\`/api/todos/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) });
			fetchTodos();
		};

		window.deleteTodo = async (id) => {
			await fetch(\`/api/todos/\${id}\`, { method: "DELETE" });
			fetchTodos();
		};

		window.togglePublic = async (id, current) => {
			await fetch("/api/todos/toggle-public", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isPublic: !current }) });
			fetchTodos();
		};

		window.toggleSteps = async (todoId) => {
			const stepsContainer = document.getElementById("steps-" + todoId);
			if (stepsContainer.style.display === "none") {
				stepsContainer.style.display = "block";
				await fetchSteps(todoId);
			} else {
				stepsContainer.style.display = "none";
			}
		};

		async function fetchSteps(todoId) {
			const res = await fetch("/api/todos/" + todoId + "/steps");
			if (!res.ok) return;
			const steps = await res.json();
			renderSteps(todoId, steps);
		}

		function renderSteps(todoId, steps) {
			const stepList = document.getElementById("stepList-" + todoId);
			if (steps.length === 0) {
				stepList.innerHTML = '<li style="color: #999; font-size: 0.875rem; padding: 0.5rem 0;">暂无步骤</li>';
				return;
			}
			stepList.innerHTML = steps.map(step => \`
				<li class="step-item \${step.completed ? 'completed' : ''}" data-id="\${step.id}">
					<input type="checkbox" \${step.completed ? 'checked' : ''} onchange="toggleStep(\${todoId}, \${step.id}, this.checked)" />
					<span class="step-title">\${escapeHtml(step.title)}</span>
					<button class="step-delete" onclick="deleteStep(\${todoId}, \${step.id})">删除</button>
				</li>
			\`).join("");
		}

		window.addStep = async (todoId) => {
			const input = document.getElementById("stepInput-" + todoId);
			const title = input.value.trim();
			if (!title) return;
			await fetch("/api/todos/" + todoId + "/steps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
			input.value = "";
			fetchSteps(todoId);
		};

		window.toggleStep = async (todoId, stepId, completed) => {
			await fetch("/api/todos/" + todoId + "/steps/" + stepId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) });
			fetchSteps(todoId);
		};

		window.deleteStep = async (todoId, stepId) => {
			await fetch("/api/todos/" + todoId + "/steps/" + stepId, { method: "DELETE" });
			fetchSteps(todoId);
		};

		async function logout() {
			await fetch("/api/auth/logout", { method: "POST" });
			window.location.href = "/";
		}

		fetchTodos();
	</script>
</body>
</html>`;
}

export function renderAuthPage(oauthProviders: Array<{ key: string; name: string; icon: string }>) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>登录 - 待办事项</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
		.auth-container { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
		h1 { text-align: center; color: #333; margin-bottom: 0.5rem; }
		.subtitle { text-align: center; color: #666; margin-bottom: 2rem; }
		.form-group { margin-bottom: 1rem; }
		.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-size: 0.875rem; }
		.form-group input { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
		.form-group input:focus { outline: none; border-color: #0E838F; }
		.submit-btn { width: 100%; padding: 0.75rem; background: #0E838F; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 1rem; transition: background 0.2s; }
		.submit-btn:hover { background: #0b6b6b; }
		.error-msg { color: #ff4d4f; text-align: center; margin-top: 1rem; font-size: 0.875rem; display: none; }
		.divider { display: flex; align-items: center; margin: 1.5rem 0; color: #999; font-size: 0.875rem; }
		.divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #ddd; }
		.divider::before { margin-right: 1rem; }
		.divider::after { margin-left: 1rem; }
		.oauth-buttons { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }
		.oauth-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; }
		.oauth-btn:hover { border-color: #0E838F; background: #f0fafa; }
		.oauth-btn .icon { font-size: 1.2rem; }
	</style>
</head>
<body>
	<div class="auth-container">
		<h1>待办事项</h1>
		<p class="subtitle">登录以开始使用</p>
		<form id="loginForm">
			<div class="form-group">
				<label>用户名</label>
				<input type="text" id="loginUsername" required />
			</div>
			<div class="form-group">
				<label>密码</label>
				<input type="password" id="loginPassword" required />
			</div>
			<button type="submit" class="submit-btn">登录</button>
		</form>
		${oauthProviders.length > 0 ? `<div class="divider">或使用以下方式登录</div><div class="oauth-buttons">${oauthProviders.map(p => `<button class="oauth-btn" onclick="oauthLogin('${p.key}')"><span class="icon">${p.icon}</span>${p.name}</button>`).join("")}</div>` : ""}
		<p class="error-msg" id="errorMsg"></p>
	</div>
	<script>
		const loginForm = document.getElementById("loginForm");
		const errorMsg = document.getElementById("errorMsg");

		function showError(msg) {
			errorMsg.textContent = msg;
			errorMsg.style.display = "block";
		}

		loginForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: document.getElementById("loginUsername").value, password: document.getElementById("loginPassword").value }) });
			const data = await res.json();
			if (!res.ok) { showError(data.error); return; }
			window.location.href = "/";
		});

		function oauthLogin(provider) {
			window.location.href = "/api/auth/oauth/authorize/" + provider;
		}
	</script>
</body>
</html>`;
}

export function renderSetupPage() {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>初始设置 - 待办事项</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
		.setup-container { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 500px; }
		h1 { text-align: center; color: #333; margin-bottom: 0.5rem; }
		.subtitle { text-align: center; color: #666; margin-bottom: 2rem; font-size: 0.875rem; }
		.provider-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
		.provider-item { border: 2px solid #eee; border-radius: 8px; overflow: hidden; }
		.provider-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; background: #fafafa; transition: background 0.2s; }
		.provider-header:hover { background: #f0fafa; }
		.provider-header .icon { font-size: 1.2rem; }
		.provider-header .name { flex: 1; font-weight: 500; }
		.provider-header .arrow { transition: transform 0.2s; }
		.provider-item.open .provider-header { background: #f0fafa; border-bottom: 1px solid #eee; }
		.provider-item.open .arrow { transform: rotate(180deg); }
		.provider-fields { padding: 1rem; display: none; }
		.provider-item.open .provider-fields { display: block; }
		.form-group { margin-bottom: 0.75rem; }
		.form-group label { display: block; margin-bottom: 0.25rem; color: #333; font-size: 0.875rem; }
		.form-group input { width: 100%; padding: 0.6rem; border: 2px solid #ddd; border-radius: 6px; font-size: 0.875rem; transition: border-color 0.2s; }
		.form-group input:focus { outline: none; border-color: #0E838F; }
		.form-group .hint { font-size: 0.75rem; color: #999; margin-top: 0.25rem; }
		.btn { width: 100%; padding: 0.75rem; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
		.btn-primary { background: #0E838F; color: white; }
		.btn-primary:hover { background: #0b6b6b; }
		.btn-primary:disabled { background: #ccc; cursor: not-allowed; }
		.msg { padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; display: none; font-size: 0.875rem; text-align: center; }
		.msg.success { display: block; background: #e6f4ea; color: #1e7e34; }
		.msg.error { display: block; background: #fde8e8; color: #c53030; }
		.msg.info { display: block; background: #e8f0fe; color: #1a73e8; }
	</style>
</head>
<body>
	<div class="setup-container">
		<h1>初始设置</h1>
		<p class="subtitle">配置至少一个 OAuth 登录方式，首个通过 OAuth 登录的用户将成为管理员</p>
		<form id="setupForm">
			<div class="provider-list">
				<div class="provider-item" data-provider="github">
					<div class="provider-header" onclick="toggleProvider(this)">
						<span class="icon">🐙</span>
						<span class="name">GitHub</span>
						<span class="arrow">▼</span>
					</div>
					<div class="provider-fields">
						<div class="form-group">
							<label>Client ID</label>
							<input type="text" name="oauth_github_client_id" placeholder="GitHub OAuth App Client ID" />
						</div>
						<div class="form-group">
							<label>Client Secret</label>
							<input type="password" name="oauth_github_client_secret" placeholder="GitHub OAuth App Client Secret" />
						</div>
						<div class="form-group">
							<label>Redirect URI</label>
							<input type="text" name="oauth_github_redirect_uri" placeholder="留空自动生成" />
							<div class="hint">在 GitHub OAuth App 设置中填入此地址</div>
						</div>
					</div>
				</div>
				<div class="provider-item" data-provider="google">
					<div class="provider-header" onclick="toggleProvider(this)">
						<span class="icon">🔵</span>
						<span class="name">Google</span>
						<span class="arrow">▼</span>
					</div>
					<div class="provider-fields">
						<div class="form-group">
							<label>Client ID</label>
							<input type="text" name="oauth_google_client_id" placeholder="Google OAuth Client ID" />
						</div>
						<div class="form-group">
							<label>Client Secret</label>
							<input type="password" name="oauth_google_client_secret" placeholder="Google OAuth Client Secret" />
						</div>
						<div class="form-group">
							<label>Redirect URI</label>
							<input type="text" name="oauth_google_redirect_uri" placeholder="留空自动生成" />
							<div class="hint">在 Google Cloud Console 中填入此地址</div>
						</div>
					</div>
				</div>
				<div class="provider-item" data-provider="microsoft">
					<div class="provider-header" onclick="toggleProvider(this)">
						<span class="icon">🪟</span>
						<span class="name">Microsoft</span>
						<span class="arrow">▼</span>
					</div>
					<div class="provider-fields">
						<div class="form-group">
							<label>Client ID</label>
							<input type="text" name="oauth_microsoft_client_id" placeholder="Azure AD App Client ID" />
						</div>
						<div class="form-group">
							<label>Client Secret</label>
							<input type="password" name="oauth_microsoft_client_secret" placeholder="Azure AD App Client Secret" />
						</div>
						<div class="form-group">
							<label>Tenant</label>
							<input type="text" name="oauth_microsoft_tenant" placeholder="common / organizations / consumers" />
							<div class="hint">留空使用 common</div>
						</div>
						<div class="form-group">
							<label>Redirect URI</label>
							<input type="text" name="oauth_microsoft_redirect_uri" placeholder="留空自动生成" />
						</div>
					</div>
				</div>
				<div class="provider-item" data-provider="gitee">
					<div class="provider-header" onclick="toggleProvider(this)">
						<span class="icon">🔷</span>
						<span class="name">Gitee</span>
						<span class="arrow">▼</span>
					</div>
					<div class="provider-fields">
						<div class="form-group">
							<label>Client ID</label>
							<input type="text" name="oauth_gitee_client_id" placeholder="Gitee OAuth App Client ID" />
						</div>
						<div class="form-group">
							<label>Client Secret</label>
							<input type="password" name="oauth_gitee_client_secret" placeholder="Gitee OAuth App Client Secret" />
						</div>
						<div class="form-group">
							<label>Redirect URI</label>
							<input type="text" name="oauth_gitee_redirect_uri" placeholder="留空自动生成" />
						</div>
					</div>
				</div>
				<div class="provider-item" data-provider="cloudflare">
					<div class="provider-header" onclick="toggleProvider(this)">
						<span class="icon">☁️</span>
						<span class="name">Cloudflare SSO</span>
						<span class="arrow">▼</span>
					</div>
					<div class="provider-fields">
						<div class="form-group">
							<label>Client ID</label>
							<input type="text" name="oauth_cloudflare_client_id" placeholder="Cloudflare OAuth Client ID" />
						</div>
						<div class="form-group">
							<label>Client Secret</label>
							<input type="password" name="oauth_cloudflare_client_secret" placeholder="Cloudflare OAuth Client Secret" />
						</div>
						<div class="form-group">
							<label>Redirect URI</label>
							<input type="text" name="oauth_cloudflare_redirect_uri" placeholder="留空自动生成" />
						</div>
					</div>
				</div>
				<div class="provider-item" data-provider="casdoor">
					<div class="provider-header" onclick="toggleProvider(this)">
						<span class="icon">🔐</span>
						<span class="name">Casdoor</span>
						<span class="arrow">▼</span>
					</div>
					<div class="provider-fields">
						<div class="form-group">
							<label>Server URL</label>
							<input type="text" name="oauth_casdoor_server_url" placeholder="https://your-casdoor.example.com" />
						</div>
						<div class="form-group">
							<label>Client ID</label>
							<input type="text" name="oauth_casdoor_client_id" placeholder="Casdoor Client ID" />
						</div>
						<div class="form-group">
							<label>Client Secret</label>
							<input type="password" name="oauth_casdoor_client_secret" placeholder="Casdoor Client Secret" />
						</div>
						<div class="form-group">
							<label>Redirect URI</label>
							<input type="text" name="oauth_casdoor_redirect_uri" placeholder="留空自动生成" />
						</div>
					</div>
				</div>
			</div>
			<button type="submit" class="btn btn-primary" id="submitBtn">保存并前往登录</button>
		</form>
		<div id="msgBox" class="msg"></div>
	</div>
	<script>
		const setupForm = document.getElementById("setupForm");
		const msgBox = document.getElementById("msgBox");
		const submitBtn = document.getElementById("submitBtn");

		function toggleProvider(header) {
			const item = header.parentElement;
			item.classList.toggle("open");
		}

		setupForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			submitBtn.disabled = true;
			submitBtn.textContent = "保存中...";
			msgBox.className = "msg";

			const formData = new FormData(setupForm);
			const data = {};
			for (const [key, value] of formData.entries()) {
				if (value.trim()) data[key] = value.trim();
			}

			const hasProvider = Object.keys(data).some(k => k.endsWith("_client_id"));
			if (!hasProvider) {
				showMsg("请至少配置一个 OAuth 提供商", "error");
				submitBtn.disabled = false;
				submitBtn.textContent = "保存并前往登录";
				return;
			}

			const res = await fetch("/api/setup/configure-oauth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			});
			const result = await res.json();
			if (!res.ok) {
				showMsg(result.error, "error");
				submitBtn.disabled = false;
				submitBtn.textContent = "保存并前往登录";
				return;
			}
			showMsg("OAuth 配置已保存，正在跳转至登录页...", "success");
			setTimeout(() => { window.location.href = "/"; }, 1500);
		});

		function showMsg(text, type) {
			msgBox.textContent = text;
			msgBox.className = "msg " + type;
		}
	</script>
</body>
</html>`;
}

export function renderPublicPage(username: string) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${username} 的公开待办</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; padding: 2rem; }
		.container { max-width: 600px; margin: 0 auto; }
		h1 { text-align: center; color: #333; margin-bottom: 0.5rem; }
		.subtitle { text-align: center; color: #666; margin-bottom: 2rem; }
		.todo-list { list-style: none; }
		.todo-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
		.todo-item.completed .todo-title { text-decoration: line-through; color: #999; }
		.todo-item input[type="checkbox"] { width: 20px; height: 20px; accent-color: #0E838F; pointer-events: none; }
		.todo-title { flex: 1; font-size: 1rem; color: #333; }
		.empty-state { text-align: center; color: #999; padding: 3rem 0; }
	</style>
</head>
<body>
	<div class="container">
		<h1>${escapeHtml(username)} 的待办</h1>
		<p class="subtitle">公开分享的待办列表</p>
		<ul class="todo-list" id="todoList"></ul>
	</div>
	<script>
		const todoList = document.getElementById("todoList");

		async function fetchTodos() {
			const res = await fetch(\`/api/public/todos?username=${escapeHtml(username)}\`);
			const data = await res.json();
			if (!res.ok) { todoList.innerHTML = '<li class="empty-state">' + data.error + '</li>'; return; }
			renderTodos(data.todos);
		}

		function renderTodos(todos) {
			if (todos.length === 0) {
				todoList.innerHTML = '<li class="empty-state">暂无公开的待办事项</li>';
				return;
			}
			todoList.innerHTML = todos.map(todo => \`
				<li class="todo-item \${todo.completed ? 'completed' : ''}">
					<input type="checkbox" \${todo.completed ? 'checked' : ''} disabled />
					<span class="todo-title">\${escapeHtml(todo.title)}</span>
				</li>
			\`).join("");
		}

		function escapeHtml(text) {
			const div = document.createElement("div");
			div.textContent = text;
			return div.innerHTML;
		}

		fetchTodos();
	</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function renderAdminPage(adminUsername: string) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>用户管理</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; padding: 2rem; }
		.container { max-width: 800px; margin: 0 auto; }
		.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
		h1 { color: #333; font-size: 2rem; }
		.back-btn { padding: 0.5rem 1rem; background: #0E838F; color: white; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.875rem; }
		.back-btn:hover { background: #0b6b6b; }
		.user-table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
		.user-table th { background: #f8f8f8; padding: 1rem; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #eee; }
		.user-table td { padding: 1rem; border-bottom: 1px solid #eee; }
		.user-table tr:last-child td { border-bottom: none; }
		.user-table tr:hover { background: #f9f9f9; }
		.badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
		.badge.admin { background: #ff9800; color: white; }
		.badge.user { background: #e8e8e8; color: #666; }
		.action-btn { padding: 0.3rem 0.6rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; margin-right: 0.5rem; transition: all 0.2s; }
		.action-btn.toggle { background: #2196f3; color: white; }
		.action-btn.toggle:hover { background: #1976d2; }
		.action-btn.delete { background: #ff4d4f; color: white; }
		.action-btn.delete:hover { background: #d9363e; }
		.action-btn.delete:disabled { background: #ccc; cursor: not-allowed; }
		.empty-state { text-align: center; color: #999; padding: 3rem 0; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>用户管理</h1>
			<div>
				<a class="back-btn" href="/admin/settings" style="margin-right: 0.5rem; background: #ff9800;">系统设置</a>
				<a class="back-btn" href="/">返回待办</a>
			</div>
		</div>
		<table class="user-table">
			<thead>
				<tr>
					<th>用户名</th>
					<th>角色</th>
					<th>注册时间</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody id="userTableBody"></tbody>
		</table>
	</div>
	<script>
		const adminUsername = "${escapeHtml(adminUsername)}";
		const userTableBody = document.getElementById("userTableBody");

		async function fetchUsers() {
			const res = await fetch("/api/admin/users");
			if (!res.ok) { window.location.href = "/"; return; }
			const users = await res.json();
			renderUsers(users);
		}

		function renderUsers(users) {
			if (users.length === 0) {
				userTableBody.innerHTML = '<tr><td colspan="4" class="empty-state">暂无用户</td></tr>';
				return;
			}
			userTableBody.innerHTML = users.map(user => \`
				<tr>
					<td>\${escapeHtml(user.username)}</td>
					<td><span class="badge \${user.is_admin ? 'admin' : 'user'}">\${user.is_admin ? '管理员' : '用户'}</span></td>
					<td>\${user.created_at}</td>
					<td>
						<button class="action-btn toggle" onclick="toggleAdmin(\${user.id})">\${user.is_admin ? '取消管理员' : '设为管理员'}</button>
						<button class="action-btn delete" onclick="deleteUser(\${user.id})" \${user.username === adminUsername ? 'disabled' : ''}>删除</button>
					</td>
				</tr>
			\`).join("");
		}

		function escapeHtml(text) {
			const div = document.createElement("div");
			div.textContent = text;
			return div.innerHTML;
		}

		window.toggleAdmin = async (userId) => {
			if (!confirm("确认切换该用户的管理员状态？")) return;
			await fetch("/api/admin/users/toggle-admin", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
			fetchUsers();
		};

		window.deleteUser = async (userId) => {
			if (!confirm("确认删除该用户及其所有待办？此操作不可恢复！")) return;
			const res = await fetch("/api/admin/users/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
			const data = await res.json();
			if (!res.ok) { alert(data.error); return; }
			fetchUsers();
		};

		fetchUsers();
	</script>
</body>
</html>`;
}

export function renderSettingsPage(adminUsername: string) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>系统设置</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; padding: 2rem; }
		.container { max-width: 700px; margin: 0 auto; }
		.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
		h1 { color: #333; font-size: 2rem; }
		.back-btn { padding: 0.5rem 1rem; background: #0E838F; color: white; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.875rem; }
		.back-btn:hover { background: #0b6b6b; }
		.card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
		.card h2 { color: #333; font-size: 1.25rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #eee; }
		.form-group { margin-bottom: 1rem; }
		.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-size: 0.875rem; font-weight: 500; }
		.form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s; }
		.form-group input:focus, .form-group select:focus { outline: none; border-color: #0E838F; }
		.toggle-group { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; }
		.toggle-group label { margin-bottom: 0; }
		.switch { position: relative; display: inline-block; width: 48px; height: 26px; }
		.switch input { opacity: 0; width: 0; height: 0; }
		.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #ccc; border-radius: 26px; transition: 0.3s; }
		.slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
		input:checked + .slider { background: #0E838F; }
		input:checked + .slider:before { transform: translateX(22px); }
		.btn { padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
		.btn-primary { background: #0E838F; color: white; }
		.btn-primary:hover { background: #0b6b6b; }
		.btn-secondary { background: #666; color: white; }
		.btn-secondary:hover { background: #555; }
		.btn-group { display: flex; gap: 0.75rem; margin-top: 1rem; }
		.msg { padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; display: none; font-size: 0.875rem; }
		.msg.success { display: block; background: #e6f4ea; color: #1e7e34; }
		.msg.error { display: block; background: #fde8e8; color: #c53030; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>系统设置</h1>
			<div>
				<a class="back-btn" href="/admin" style="margin-right: 0.5rem; background: #666;">用户管理</a>
				<a class="back-btn" href="/">返回待办</a>
			</div>
		</div>
		<div class="card">
			<h2>注册设置</h2>
			<div class="toggle-group">
				<label>允许新用户注册</label>
				<label class="switch">
					<input type="checkbox" id="regToggle" />
					<span class="slider"></span>
				</label>
			</div>
			<div class="toggle-group">
				<label>强制验证邮箱（登录前必须绑定并验证邮箱）</label>
				<label class="switch">
					<input type="checkbox" id="emailVerifyToggle" />
					<span class="slider"></span>
				</label>
			</div>
		</div>
		<div class="card">
			<h2>邮件服务配置</h2>
			<form id="smtpForm">
				<div class="form-group">
					<label>邮件服务商</label>
					<select id="emailProvider">
						<option value="">不使用邮件服务（仅显示验证码）</option>
						<option value="resend">Resend</option>
						<option value="sendgrid">SendGrid</option>
						<option value="brevo">Brevo</option>
						<option value="wecom">企业微信邮箱</option>
						<option value="lark">飞书邮箱</option>
						<option value="custom_smtp">自定义 SMTP</option>
					</select>
				</div>
				<div class="form-group" id="apiKeyGroup">
					<label>API Key</label>
					<input type="password" id="emailApiKey" placeholder="填入对应服务商的 API Key" />
				</div>
				<div id="smtpFields" style="display: none;">
					<div class="form-group">
						<label>SMTP 服务器地址</label>
						<input type="text" id="smtpHost" placeholder="smtp.example.com" />
					</div>
					<div class="form-group">
						<label>SMTP 端口</label>
						<input type="number" id="smtpPort" placeholder="587" />
					</div>
					<div class="form-group">
						<label>SMTP 用户名</label>
						<input type="text" id="smtpUser" placeholder="user@example.com" />
					</div>
					<div class="form-group">
						<label>SMTP 密码</label>
						<input type="password" id="smtpPass" placeholder="SMTP 密码或授权码" />
					</div>
				</div>
				<div id="wecomFields" style="display: none;">
					<div class="form-group">
						<label>企业 ID (Corp ID)</label>
						<input type="text" id="wecomCorpId" placeholder="wwxxxxxxxxxxxxxxxx" />
					</div>
					<div class="form-group">
						<label>应用 Secret</label>
						<input type="password" id="wecomAppSecret" placeholder="应用的 Secret" />
					</div>
				</div>
				<div id="larkFields" style="display: none;">
					<div class="form-group">
						<label>User Access Token</label>
						<input type="password" id="larkUserAccessToken" placeholder="填入飞书用户访问令牌" />
					</div>
					<div class="form-group">
						<label>用户邮箱 ID（留空代表当前用户）</label>
						<input type="text" id="larkUserMailboxId" placeholder="user@xxx.xx 或留空" />
					</div>
				</div>
				<div class="form-group">
					<label>发件人地址</label>
					<input type="email" id="smtpFrom" placeholder="noreply@example.com" />
				</div>
				<div class="form-group">
					<label>测试邮件收件人</label>
					<input type="email" id="testRecipient" placeholder="test@example.com" />
				</div>
				<div class="btn-group">
					<button type="submit" class="btn btn-primary">保存配置</button>
					<button type="button" class="btn btn-secondary" onclick="testSmtp()">发送测试邮件</button>
				</div>
			</form>
		</div>
		<div class="card">
			<h2>OAuth 登录配置</h2>
			<p style="color: #666; font-size: 0.875rem; margin-bottom: 1rem;">配置 OAuth 后，用户可通过第三方账号登录。首次使用时请先配置至少一个 OAuth 提供商。</p>
			<div id="oauthConfigs"></div>
			<div class="btn-group">
				<button type="button" class="btn btn-primary" onclick="saveOAuthSettings()">保存 OAuth 配置</button>
			</div>
		</div>
		<div id="msgBox" class="msg"></div>
	</div>
	<script>
		const regToggle = document.getElementById("regToggle");
		const emailVerifyToggle = document.getElementById("emailVerifyToggle");
		const smtpForm = document.getElementById("smtpForm");
		const msgBox = document.getElementById("msgBox");
		const emailProvider = document.getElementById("emailProvider");
		const apiKeyGroup = document.getElementById("apiKeyGroup");
		const smtpFields = document.getElementById("smtpFields");
		const wecomFields = document.getElementById("wecomFields");
		const larkFields = document.getElementById("larkFields");

		const oauthProviders = [
			{ key: "casdoor", name: "Casdoor", fields: ["client_id", "client_secret", "server_url", "redirect_uri"] },
			{ key: "github", name: "GitHub", fields: ["client_id", "client_secret", "redirect_uri"] },
			{ key: "gitee", name: "Gitee", fields: ["client_id", "client_secret", "redirect_uri"] },
			{ key: "cloudflare", name: "Cloudflare SSO", fields: ["client_id", "client_secret", "redirect_uri"] },
			{ key: "microsoft", name: "Microsoft", fields: ["client_id", "client_secret", "tenant", "redirect_uri"] },
			{ key: "google", name: "Google", fields: ["client_id", "client_secret", "redirect_uri"] },
		];

		function renderOAuthConfigs() {
			const container = document.getElementById("oauthConfigs");
			container.innerHTML = oauthProviders.map(p => \`
				<details style="margin-bottom: 1rem; border: 1px solid #eee; border-radius: 6px;">
					<summary style="padding: 0.75rem 1rem; cursor: pointer; font-weight: 500;">\${p.name}</summary>
					<div style="padding: 1rem;">
						\${p.fields.map(f => {
							const settingKey = \`oauth_\${p.key}_\${f}\`;
							const label = f === "client_id" ? "Client ID" : f === "client_secret" ? "Client Secret" : f === "server_url" ? "Server URL" : f === "tenant" ? "Tenant (留空使用 common)" : "Redirect URI";
							const placeholder = f === "client_id" ? "OAuth Client ID" : f === "client_secret" ? "OAuth Client Secret" : f === "server_url" ? "https://your-casdoor.example.com" : f === "tenant" ? "common / organizations / consumers" : "留空自动生成";
							const type = f === "client_secret" ? "password" : "text";
							return \`<div class="form-group"><label>\${label}</label><input type="\${type}" id="\${settingKey}" placeholder="\${placeholder}" /></div>\`;
						}).join("")}
					</div>
				</details>
			\`).join("");
		}

		function toggleProviderFields() {
			const provider = emailProvider.value;
			apiKeyGroup.style.display = (provider === "custom_smtp" || provider === "wecom" || provider === "lark") ? "none" : "block";
			smtpFields.style.display = provider === "custom_smtp" ? "block" : "none";
			wecomFields.style.display = provider === "wecom" ? "block" : "none";
			larkFields.style.display = provider === "lark" ? "block" : "none";
		}

		emailProvider.addEventListener("change", toggleProviderFields);

		async function loadSettings() {
			const res = await fetch("/api/admin/settings");
			if (!res.ok) { window.location.href = "/"; return; }
			const s = await res.json();
			regToggle.checked = s.registration_enabled === "true";
			emailVerifyToggle.checked = s.email_verification_required === "true";
			document.getElementById("emailProvider").value = s.email_provider || "";
			document.getElementById("emailApiKey").value = s.email_api_key || "";
			document.getElementById("smtpHost").value = s.smtp_host || "";
			document.getElementById("smtpPort").value = s.smtp_port || "";
			document.getElementById("smtpUser").value = s.smtp_user || "";
			document.getElementById("smtpPass").value = "";
			document.getElementById("wecomCorpId").value = s.wecom_corp_id || "";
			document.getElementById("wecomAppSecret").value = "";
			document.getElementById("larkUserAccessToken").value = "";
			document.getElementById("larkUserMailboxId").value = s.lark_user_mailbox_id || "";
			document.getElementById("smtpFrom").value = s.smtp_from || "";
			document.getElementById("testRecipient").value = s.test_email_recipient || "";

			oauthProviders.forEach(p => {
				p.fields.forEach(f => {
					const el = document.getElementById(\`oauth_\${p.key}_\${f}\`);
					if (el) el.value = s[\`oauth_\${p.key}_\${f}\`] || "";
				});
			});

			toggleProviderFields();
			renderOAuthConfigs();
			oauthProviders.forEach(p => {
				p.fields.forEach(f => {
					const el = document.getElementById(\`oauth_\${p.key}_\${f}\`);
					if (el && s[\`oauth_\${p.key}_\${f}\`]) el.value = s[\`oauth_\${p.key}_\${f}\`];
				});
			});
		}

		regToggle.addEventListener("change", async () => {
			await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registration_enabled: regToggle.checked ? "true" : "false" }) });
			showMsg("注册设置已更新", "success");
		});

		emailVerifyToggle.addEventListener("change", async () => {
			await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email_verification_required: emailVerifyToggle.checked ? "true" : "false" }) });
			showMsg("邮箱验证设置已更新", "success");
		});

		smtpForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const data = {
				email_provider: document.getElementById("emailProvider").value.trim(),
				email_api_key: document.getElementById("emailApiKey").value.trim(),
				smtp_host: document.getElementById("smtpHost").value.trim(),
				smtp_port: document.getElementById("smtpPort").value.trim(),
				smtp_user: document.getElementById("smtpUser").value.trim(),
				smtp_pass: document.getElementById("smtpPass").value.trim(),
				wecom_corp_id: document.getElementById("wecomCorpId").value.trim(),
				wecom_app_secret: document.getElementById("wecomAppSecret").value.trim(),
				lark_user_access_token: document.getElementById("larkUserAccessToken").value.trim(),
				lark_user_mailbox_id: document.getElementById("larkUserMailboxId").value.trim(),
				smtp_from: document.getElementById("smtpFrom").value.trim(),
				test_email_recipient: document.getElementById("testRecipient").value.trim(),
			};
			const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
			const result = await res.json();
			if (!res.ok) { showMsg(result.error, "error"); return; }
			showMsg("邮件配置已保存", "success");
		});

		window.saveOAuthSettings = async () => {
			const data = {};
			oauthProviders.forEach(p => {
				p.fields.forEach(f => {
					const el = document.getElementById(\`oauth_\${p.key}_\${f}\`);
					if (el) data[\`oauth_\${p.key}_\${f}\`] = el.value.trim();
				});
			});
			const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
			const result = await res.json();
			if (!res.ok) { showMsg(result.error, "error"); return; }
			showMsg("OAuth 配置已保存", "success");
		};

		window.testSmtp = async () => {
			const res = await fetch("/api/admin/settings/smtp-test", { method: "POST" });
			const result = await res.json();
			if (!res.ok) { showMsg(result.error, "error"); return; }
			showMsg(result.message, "success");
		};

		function showMsg(text, type) {
			msgBox.textContent = text;
			msgBox.className = "msg " + type;
			setTimeout(() => { msgBox.className = "msg"; }, 5000);
		}

		loadSettings();
	</script>
</body>
</html>`;
}

export function renderProfilePage(username: string, email: string | null, emailVerified: boolean) {
	const verifiedBadge = emailVerified ? '<span style="color: #1e7e34; font-size: 0.75rem;">已验证</span>' : '<span style="color: #c53030; font-size: 0.75rem;">未验证</span>';
	const emailDisplay = email || "未绑定";
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>个人资料</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; padding: 2rem; }
		.container { max-width: 500px; margin: 0 auto; }
		.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
		h1 { color: #333; font-size: 2rem; }
		.back-btn { padding: 0.5rem 1rem; background: #0E838F; color: white; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.875rem; }
		.back-btn:hover { background: #0b6b6b; }
		.card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
		.info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #eee; }
		.info-row:last-child { border-bottom: none; }
		.info-label { color: #666; font-size: 0.875rem; }
		.info-value { color: #333; font-weight: 500; }
		.form-group { margin-bottom: 1rem; }
		.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-size: 0.875rem; }
		.form-group input { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s; }
		.form-group input:focus { outline: none; border-color: #0E838F; }
		.btn { padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
		.btn-primary { background: #0E838F; color: white; }
		.btn-primary:hover { background: #0b6b6b; }
		.btn-secondary { background: #666; color: white; }
		.btn-secondary:hover { background: #555; }
		.btn-group { display: flex; gap: 0.75rem; margin-top: 1rem; }
		.msg { padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; display: none; font-size: 0.875rem; }
		.msg.success { display: block; background: #e6f4ea; color: #1e7e34; }
		.msg.error { display: block; background: #fde8e8; color: #c53030; }
		.verify-section { display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; }
		.verify-section.active { display: block; }
		.code-inputs { display: flex; gap: 0.5rem; justify-content: center; margin: 1rem 0; }
		.code-inputs input { width: 48px; height: 56px; text-align: center; font-size: 1.5rem; border: 2px solid #ddd; border-radius: 8px; }
		.code-inputs input:focus { outline: none; border-color: #0E838F; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>个人资料</h1>
			<a class="back-btn" href="/">返回待办</a>
		</div>
		<div class="card">
			<div class="info-row">
				<span class="info-label">用户名</span>
				<span class="info-value">${escapeHtml(username)}</span>
			</div>
			<div class="info-row">
				<span class="info-label">邮箱</span>
				<span class="info-value">${emailDisplay} ${verifiedBadge}</span>
			</div>
		</div>
		<div class="card">
			<h2 style="margin-bottom: 1rem;">绑定邮箱</h2>
			<form id="emailForm">
				<div class="form-group">
					<label>邮箱地址</label>
					<input type="email" id="emailInput" placeholder="your@email.com" value="${email ? escapeHtml(email) : ""}" />
				</div>
				<button type="submit" class="btn btn-primary" id="sendCodeBtn">发送验证码</button>
			</form>
			<div class="verify-section" id="verifySection">
				<p style="text-align: center; color: #666; margin-bottom: 0.5rem;">请输入收到的验证码</p>
				<div class="code-inputs">
					<input type="text" maxlength="1" class="code-input" data-index="0" />
					<input type="text" maxlength="1" class="code-input" data-index="1" />
					<input type="text" maxlength="1" class="code-input" data-index="2" />
					<input type="text" maxlength="1" class="code-input" data-index="3" />
					<input type="text" maxlength="1" class="code-input" data-index="4" />
					<input type="text" maxlength="1" class="code-input" data-index="5" />
				</div>
				<div class="btn-group">
					<button type="button" class="btn btn-primary" onclick="verifyCode()">验证</button>
					<button type="button" class="btn btn-secondary" onclick="cancelVerify()">取消</button>
				</div>
			</div>
		</div>
		<div id="msgBox" class="msg"></div>
	</div>
	<script>
		const emailForm = document.getElementById("emailForm");
		const emailInput = document.getElementById("emailInput");
		const verifySection = document.getElementById("verifySection");
		const msgBox = document.getElementById("msgBox");
		let currentEmail = "";

		emailForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const email = emailInput.value.trim();
			if (!email || !email.includes("@")) { showMsg("请输入有效的邮箱地址", "error"); return; }
			currentEmail = email;
			const res = await fetch("/api/email/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
			const data = await res.json();
			if (!res.ok) { showMsg(data.error, "error"); return; }
			verifySection.classList.add("active");
			showMsg("验证码已发送", "success");
		});

		window.verifyCode = async () => {
			const code = Array.from(document.querySelectorAll(".code-input")).map(i => i.value).join("");
			if (code.length !== 6) { showMsg("请输入完整的6位验证码", "error"); return; }
			const res = await fetch("/api/email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: currentEmail, code }) });
			const data = await res.json();
			if (!res.ok) { showMsg(data.error, "error"); return; }
			showMsg("邮箱验证成功", "success");
			setTimeout(() => { window.location.reload(); }, 1500);
		};

		window.cancelVerify = () => {
			verifySection.classList.remove("active");
			document.querySelectorAll(".code-input").forEach(i => i.value = "");
		};

		document.querySelectorAll(".code-input").forEach((input, idx, inputs) => {
			input.addEventListener("input", (e) => {
				const val = e.target.value.replace(/[^0-9]/g, "");
				e.target.value = val;
				if (val && idx < inputs.length - 1) inputs[idx + 1].focus();
			});
			input.addEventListener("keydown", (e) => {
				if (e.key === "Backspace" && !e.target.value && idx > 0) inputs[idx - 1].focus();
			});
		});

		function showMsg(text, type) {
			msgBox.textContent = text;
			msgBox.className = "msg " + type;
			setTimeout(() => { msgBox.className = "msg"; }, 5000);
		}
	</script>
</body>
</html>`;
}
