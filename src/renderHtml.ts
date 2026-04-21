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
		.container { max-width: 900px; margin: 0 auto; display: flex; gap: 1.5rem; }
		.sidebar { width: 220px; flex-shrink: 0; }
		.main { flex: 1; min-width: 0; }
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
		.todo-item { background: white; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s; }
		.todo-item:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
		.todo-row { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; }
		.todo-item.completed .todo-title { text-decoration: line-through; color: #999; }
		.todo-row input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; accent-color: #0E838F; }
		.todo-title { flex: 1; font-size: 1rem; color: #333; }
		.todo-actions { display: flex; gap: 0.5rem; align-items: center; }
		.public-toggle { padding: 0.3rem 0.6rem; background: #e8e8e8; color: #666; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
		.public-toggle.active { background: #0E838F; color: white; }
		.delete-btn { padding: 0.4rem 0.8rem; background: #ff4d4f; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; transition: background 0.2s; }
		.delete-btn:hover { background: #d9363e; }
		.steps-btn { padding: 0.3rem 0.6rem; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
		.steps-btn:hover { background: #7b1fa2; }
		.tag-btn { padding: 0.3rem 0.6rem; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
		.tag-btn:hover { background: #388e3c; }
		.todo-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; padding: 0 1rem 0.75rem; }
		.tag-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; color: white; cursor: pointer; }
		.tag-badge:hover { opacity: 0.8; }
		.steps-container { padding: 0 1rem 1rem 1rem; }
		.steps-inner { padding: 0.75rem; background: #f9f9f9; border-radius: 6px; border-left: 3px solid #9c27b0; }
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
		.filter-section { background: white; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
		.filter-section h3 { font-size: 0.875rem; color: #666; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #eee; }
		.filter-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0; cursor: pointer; font-size: 0.875rem; }
		.filter-item:hover { color: #0E838F; }
		.filter-item.active { color: #0E838F; font-weight: 600; }
		.filter-item .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
		.filter-item .tag-name { flex: 1; }
		.filter-item .tag-actions { display: flex; gap: 0.15rem; opacity: 0; transition: opacity 0.2s; }
		.filter-item:hover .tag-actions { opacity: 1; }
		.filter-item .tag-actions button { padding: 0.1rem 0.3rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.65rem; background: transparent; color: #999; }
		.filter-item .tag-actions button:hover { background: #eee; color: #333; }
		.filter-item .tag-actions button.delete:hover { background: #fde8e8; color: #c53030; }
		.filter-item .tag-actions select { padding: 0.1rem; border: 1px solid #ddd; border-radius: 3px; font-size: 0.65rem; background: white; }
		.filter-item .tag-actions input[type="color"] { width: 20px; height: 20px; padding: 0; border: 1px solid #ddd; border-radius: 3px; cursor: pointer; }
		.filter-group-header { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: #333; }
		.filter-group-header:hover { color: #0E838F; }
		.filter-group-header .group-actions { display: flex; gap: 0.25rem; }
		.filter-group-header .group-actions button { padding: 0.1rem 0.3rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.65rem; background: transparent; color: #999; }
		.filter-group-header .group-actions button:hover { background: #eee; color: #333; }
		.filter-group-header .group-actions button.delete:hover { background: #fde8e8; color: #c53030; }
		.public-group-toggle { padding: 0.2rem 0.4rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.65rem; background: #e8e8e8; color: #666; transition: all 0.2s; }
		.public-group-toggle.active { background: #0E838F; color: white; }
		.filter-group-items { padding-left: 1rem; }
		.add-group-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 0.4rem; border: 1px dashed #ccc; border-radius: 6px; background: transparent; color: #999; cursor: pointer; font-size: 0.8rem; margin-top: 0.5rem; transition: all 0.2s; }
		.add-group-btn:hover { border-color: #0E838F; color: #0E838F; background: #f0fafa; }
		.group-input-inline { display: flex; gap: 0.3rem; margin-top: 0.5rem; }
		.group-input-inline input { flex: 1; padding: 0.3rem 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem; }
		.group-input-inline button { padding: 0.3rem 0.6rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
		.group-input-inline .confirm { background: #0E838F; color: white; }
		.group-input-inline .cancel { background: #eee; color: #666; }
		.tag-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
		.tag-modal { background: white; border-radius: 12px; padding: 1.5rem; width: 90%; max-width: 400px; max-height: 80vh; overflow-y: auto; }
		.tag-modal h3 { margin-bottom: 1rem; color: #333; }
		.tag-modal .tag-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 6px; cursor: pointer; }
		.tag-modal .tag-option:hover { background: #f5f5f5; }
		.tag-modal .tag-option.selected { background: #e8f8f8; }
		.tag-modal .tag-option input[type="checkbox"] { accent-color: #0E838F; }
		.tag-modal .new-tag-input { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
		.tag-modal .new-tag-input input { flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; min-width: 120px; }
		.tag-modal .new-tag-input select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem; }
		.tag-modal .new-tag-input input[type="color"] { width: 36px; height: 36px; padding: 2px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
		.tag-modal .new-tag-input button { padding: 0.5rem 1rem; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
		.tag-modal .close-btn { margin-top: 1rem; width: 100%; padding: 0.75rem; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; }
		.tag-modal .group-label { font-size: 0.75rem; color: #999; margin-top: 0.75rem; margin-bottom: 0.25rem; font-weight: 600; }
	</style>
</head>
<body>
	<div class="container">
		<div class="sidebar">
			<div class="filter-section">
				<h3>筛选</h3>
				<div class="filter-item active" data-filter="all" onclick="setFilter('all')">全部</div>
				<div id="tagFilters"></div>
			</div>
			<div class="filter-section">
				<h3>标签分组</h3>
				<div id="groupFilters"></div>
				<button class="add-group-btn" onclick="showAddGroupInput()">+ 新建分组</button>
				<div id="addGroupForm" style="display: none;"></div>
			</div>
		</div>
		<div class="main">
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
	</div>
	<div class="tag-modal-overlay" id="tagModal" style="display: none;">
		<div class="tag-modal">
			<h3>管理标签</h3>
			<div id="tagOptions"></div>
			<div class="new-tag-input">
				<input type="text" id="newTagInput" placeholder="输入新标签名称..." />
				<input type="color" id="newTagColor" value="#0E838F" title="选择颜色" />
				<select id="newTagGroup"><option value="">无分组</option></select>
				<button onclick="createNewTag()">创建</button>
			</div>
			<button class="close-btn" onclick="closeTagModal()">关闭</button>
		</div>
	</div>
	<script>
		const username = "${escapeHtml(username)}";
		const todoList = document.getElementById("todoList");
		const todoInput = document.getElementById("todoInput");
		const addForm = document.getElementById("addForm");
		const shareUrl = document.getElementById("shareUrl");
		const tagFilters = document.getElementById("tagFilters");
		const groupFilters = document.getElementById("groupFilters");
		const tagModal = document.getElementById("tagModal");
		const tagOptions = document.getElementById("tagOptions");

		shareUrl.textContent = window.location.origin + "/public/" + username;

		let allTags = [];
		let allGroups = [];
		let allTodos = [];
		let currentFilter = { type: "all", id: null };
		let currentTagTodoId = null;
		let editingGroupId = null;

		async function fetchData() {
			const [todosRes, tagsRes, groupsRes] = await Promise.all([
				fetch("/api/todos"),
				fetch("/api/tags"),
				fetch("/api/tag-groups")
			]);
			if (todosRes.status === 401) { window.location.href = "/"; return; }
			allTodos = await todosRes.json();
			allTags = await tagsRes.json();
			allGroups = await groupsRes.json();
			renderFilters();
			renderTodos();
		}

		function renderFilters() {
			tagFilters.innerHTML = allTags.map(tag => {
				const groupOptions = allGroups.map(g => \`<option value="\${g.id}" \${tag.group_id === g.id ? 'selected' : ''}>\${escapeHtml(g.name)}</option>\`).join("");
				return \`
					<div class="filter-item" data-filter="tag" data-id="\${tag.id}" onclick="setFilter('tag', \${tag.id})">
						<span class="dot" style="background: \${tag.color}"></span>
						<span class="tag-name">\${escapeHtml(tag.name)}</span>
						<div class="tag-actions">
							<input type="color" value="\${tag.color}" onclick="event.stopPropagation()" onchange="changeTagColor(\${tag.id}, this.value)" title="修改颜色" />
							<select onclick="event.stopPropagation()" onchange="changeTagGroup(\${tag.id}, this.value)">
								<option value="">无分组</option>
								\${groupOptions}
							</select>
							<button class="delete" onclick="event.stopPropagation();deleteTag(\${tag.id})">✕</button>
						</div>
					</div>
				\`;
			}).join("");

			groupFilters.innerHTML = allGroups.map(group => {
				const groupTags = allTags.filter(t => t.group_id === group.id);
				const tagsHtml = groupTags.map(tag => \`
					<div class="filter-item" data-filter="tag" data-id="\${tag.id}" onclick="setFilter('tag', \${tag.id})">
						<span class="dot" style="background: \${tag.color}"></span>
						<span>\${escapeHtml(tag.name)}</span>
					</div>
				\`).join("");
				const isEditing = editingGroupId === group.id;
				const nameHtml = isEditing
					? \`<input type="text" id="editGroupInput-\${group.id}" value="\${escapeHtml(group.name)}" style="flex:1;padding:0.2rem 0.4rem;border:1px solid #ddd;border-radius:3px;font-size:0.875rem;" onclick="event.stopPropagation()" onkeydown="if(event.key==='Enter')saveGroupEdit(\${group.id})" />\`
					: \`<span>\${escapeHtml(group.name)}</span>\`;
				const actionsHtml = isEditing
					? \`<div class="group-actions">
							<button onclick="event.stopPropagation();saveGroupEdit(\${group.id})">✓</button>
							<button class="cancel" onclick="event.stopPropagation();cancelGroupEdit()">✗</button>
						</div>\`
					: \`<div class="group-actions">
							<button class="public-group-toggle \${group.is_public ? 'active' : ''}" onclick="event.stopPropagation();toggleGroupPublic(\${group.id}, \${group.is_public})" title="\${group.is_public ? '公开' : '私有'}">\${group.is_public ? '公开' : '私有'}</button>
							<button onclick="event.stopPropagation();startGroupEdit(\${group.id})">✎</button>
							<button class="delete" onclick="event.stopPropagation();deleteGroup(\${group.id})">✕</button>
						</div>\`;
				return \`
					<div>
						<div class="filter-group-header" onclick="setFilter('group', \${group.id})">
							\${nameHtml}
							\${actionsHtml}
						</div>
						<div class="filter-group-items">\${tagsHtml}</div>
					</div>
				\`;
			}).join("");
		}

		window.showAddGroupInput = function() {
			const form = document.getElementById("addGroupForm");
			form.innerHTML = \`<div class="group-input-inline">
				<input type="text" id="newGroupInput" placeholder="分组名称..." onkeydown="if(event.key==='Enter')createGroup()" />
				<button class="confirm" onclick="createGroup()">✓</button>
				<button class="cancel" onclick="hideAddGroupInput()">✗</button>
			</div>\`;
			form.style.display = "block";
			document.getElementById("newGroupInput").focus();
		};

		window.hideAddGroupInput = function() {
			document.getElementById("addGroupForm").style.display = "none";
			document.getElementById("addGroupForm").innerHTML = "";
		};

		window.createGroup = async function() {
			const input = document.getElementById("newGroupInput");
			const name = input.value.trim();
			if (!name) return;
			const res = await fetch("/api/tag-groups", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name })
			});
			if (res.ok) {
				hideAddGroupInput();
				await fetchData();
			}
		};

		window.startGroupEdit = function(id) {
			editingGroupId = id;
			renderFilters();
			setTimeout(() => {
				const el = document.getElementById("editGroupInput-" + id);
				if (el) { el.focus(); el.select(); }
			}, 0);
		};

		window.saveGroupEdit = async function(id) {
			const input = document.getElementById("editGroupInput-" + id);
			const name = input.value.trim();
			if (!name) return;
			const res = await fetch("/api/tag-groups/" + id, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name })
			});
			if (res.ok) {
				editingGroupId = null;
				await fetchData();
			}
		};

		window.cancelGroupEdit = function() {
			editingGroupId = null;
			renderFilters();
		};

		window.deleteGroup = async function(id) {
			if (!confirm("删除分组后，该分组下的标签将变为无分组标签，是否继续？")) return;
			const res = await fetch("/api/tag-groups/" + id, { method: "DELETE" });
			if (res.ok) {
				if (currentFilter.type === "group" && currentFilter.id === id) {
					currentFilter = { type: "all", id: null };
				}
				await fetchData();
			}
		};

		window.toggleGroupPublic = async function(id, current) {
			const res = await fetch("/api/tag-groups/" + id, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ is_public: !current })
			});
			if (res.ok) {
				await fetchData();
			}
		};

		window.deleteTag = async function(id) {
			if (!confirm("确定删除该标签？已关联的待办将移除该标签。")) return;
			const res = await fetch("/api/tags/" + id, { method: "DELETE" });
			if (res.ok) {
				if (currentFilter.type === "tag" && currentFilter.id === id) {
					currentFilter = { type: "all", id: null };
				}
				await fetchData();
			}
		};

		window.changeTagGroup = async function(tagId, groupId) {
			const gid = groupId ? parseInt(groupId) : null;
			const res = await fetch("/api/tags/" + tagId, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ group_id: gid })
			});
			if (res.ok) {
				await fetchData();
			}
		};

		window.changeTagColor = async function(tagId, color) {
			const res = await fetch("/api/tags/" + tagId, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ color })
			});
			if (res.ok) {
				await fetchData();
			}
		};

		window.setFilter = function(type, id) {
			currentFilter = { type, id };
			document.querySelectorAll(".filter-item").forEach(el => el.classList.remove("active"));
			if (type === "all") {
				document.querySelector('[data-filter="all"]').classList.add("active");
			} else {
				const el = document.querySelector('[data-filter="tag"][data-id="' + id + '"]');
				if (el) el.classList.add("active");
			}
			renderTodos();
		};

		function getFilteredTodos() {
			if (currentFilter.type === "all") return allTodos;
			if (currentFilter.type === "tag") {
				return allTodos.filter(todo => todo.tags && todo.tags.some(t => t.id === currentFilter.id));
			}
			if (currentFilter.type === "group") {
				return allTodos.filter(todo => todo.tags && todo.tags.some(t => {
					const tag = allTags.find(tag => tag.id === t.id);
					return tag && tag.group_id === currentFilter.id;
				}));
			}
			return allTodos;
		}

		function renderTodos() {
			const filtered = getFilteredTodos();
			if (filtered.length === 0) {
				todoList.innerHTML = '<li class="empty-state">暂无待办事项，添加一个吧！</li>';
				return;
			}
			todoList.innerHTML = filtered.map(todo => {
				const tagsHtml = (todo.tags || []).map(tag => \`
					<span class="tag-badge" style="background: \${tag.color}" title="\${escapeHtml(tag.name)}">\${escapeHtml(tag.name)}</span>
				\`).join("");
				return \`
					<li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
						<div class="todo-row">
							<input type="checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${todo.id}, this.checked)" />
							<span class="todo-title">\${escapeHtml(todo.title)}</span>
							<div class="todo-actions">
								<button class="tag-btn" onclick="openTagModal(\${todo.id})">标签</button>
								<button class="steps-btn" onclick="toggleSteps(\${todo.id})">步骤</button>
								<button class="public-toggle \${todo.is_public ? 'active' : ''}" onclick="togglePublic(\${todo.id}, \${todo.is_public})">\${todo.is_public ? '公开' : '私有'}</button>
								<button class="delete-btn" onclick="deleteTodo(\${todo.id})">删除</button>
							</div>
						</div>
						<div class="todo-tags">\${tagsHtml}</div>
						<div class="steps-container" id="steps-\${todo.id}" style="display: none;">
							<div class="steps-inner">
								<div class="steps-header">
									<h4>步骤</h4>
								</div>
								<div class="step-add">
									<input type="text" id="stepInput-\${todo.id}" placeholder="添加步骤..." />
									<button onclick="addStep(\${todo.id})">添加</button>
								</div>
								<ul class="step-list" id="stepList-\${todo.id}"></ul>
							</div>
						</div>
					</li>
				\`;
			}).join("");
		}

		window.openTagModal = async function(todoId) {
			currentTagTodoId = todoId;
			const todo = allTodos.find(t => t.id === todoId);
			const selectedTagIds = (todo && todo.tags) ? todo.tags.map(t => t.id) : [];

			const groupSelect = document.getElementById("newTagGroup");
			groupSelect.innerHTML = '<option value="">无分组</option>' + allGroups.map(g => \`<option value="\${g.id}">\${escapeHtml(g.name)}</option>\`).join("");

			let html = "";
			const groupedTags = {};
			allTags.forEach(tag => {
				const groupId = tag.group_id || "ungrouped";
				if (!groupedTags[groupId]) groupedTags[groupId] = [];
				groupedTags[groupId].push(tag);
			});

			if (groupedTags["ungrouped"] && groupedTags["ungrouped"].length > 0) {
				html += '<div class="group-label">无分组</div>';
				groupedTags["ungrouped"].forEach(tag => {
					const checked = selectedTagIds.includes(tag.id) ? "checked" : "";
					html += \`<label class="tag-option \${checked ? 'selected' : ''}">
						<input type="checkbox" \${checked} onchange="toggleTagSelection(this, \${tag.id})" />
						<span class="dot" style="background: \${tag.color}"></span>
						<span>\${escapeHtml(tag.name)}</span>
					</label>\`;
				});
			}

			allGroups.forEach(group => {
				const tags = groupedTags[group.id] || [];
				if (tags.length > 0) {
					html += \`<div class="group-label">\${escapeHtml(group.name)}</div>\`;
					tags.forEach(tag => {
						const checked = selectedTagIds.includes(tag.id) ? "checked" : "";
						html += \`<label class="tag-option \${checked ? 'selected' : ''}">
							<input type="checkbox" \${checked} onchange="toggleTagSelection(this, \${tag.id})" />
							<span class="dot" style="background: \${tag.color}"></span>
							<span>\${escapeHtml(tag.name)}</span>
						</label>\`;
					});
				}
			});

			if (allTags.length === 0) {
				html = '<p style="color: #999; font-size: 0.875rem;">暂无标签，请在下方创建</p>';
			}

			tagOptions.innerHTML = html;
			tagModal.style.display = "flex";
		};

		window.toggleTagSelection = function(checkbox, tagId) {
			checkbox.closest(".tag-option").classList.toggle("selected", checkbox.checked);
			applyTags();
		};

		async function applyTags() {
			if (!currentTagTodoId) return;
			const checkboxes = tagOptions.querySelectorAll("input[type='checkbox']");
			const tagIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => parseInt(cb.getAttribute("onchange").match(/\\d+/)[0]));
			await fetch("/api/todos/" + currentTagTodoId + "/tags", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tag_ids: tagIds })
			});
			await fetchData();
		}

		window.createNewTag = async function() {
			const input = document.getElementById("newTagInput");
			const colorInput = document.getElementById("newTagColor");
			const groupSelect = document.getElementById("newTagGroup");
			const name = input.value.trim();
			if (!name) return;
			const color = colorInput.value;
			const groupId = groupSelect.value ? parseInt(groupSelect.value) : null;
			const res = await fetch("/api/tags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, color, group_id: groupId })
			});
			if (res.ok) {
				input.value = "";
				colorInput.value = "#0E838F";
				await fetchData();
				openTagModal(currentTagTodoId);
				const newTag = allTags.find(t => t.name === name);
				if (newTag) {
					const checkbox = tagOptions.querySelector("input[onchange*='" + newTag.id + "']");
					if (checkbox) {
						checkbox.checked = true;
						checkbox.closest(".tag-option").classList.add("selected");
						await applyTags();
					}
				}
			}
		};

		window.closeTagModal = function() {
			tagModal.style.display = "none";
			currentTagTodoId = null;
		};

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
			fetchData();
		});

		window.toggleTodo = async (id, completed) => {
			await fetch(\`/api/todos/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) });
			fetchData();
		};

		window.deleteTodo = async (id) => {
			await fetch(\`/api/todos/\${id}\`, { method: "DELETE" });
			fetchData();
		};

		window.togglePublic = async (id, current) => {
			await fetch("/api/todos/toggle-public", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isPublic: !current }) });
			fetchData();
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

		fetchData();
	</script>
</body>
</html>`;
}

export function renderAuthPage(oauthProviders: Array<{ key: string; name: string; icon: string }>, turnstileSiteKey: string, registrationEnabled: boolean) {
	const turnstileContainer = (id: string) => turnstileSiteKey ? `<div class="turnstile-container"><div id="${id}"></div></div>` : "";
	const turnstileScript = turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad" defer></script>' : "";
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
		.success-msg { color: #1e7e34; text-align: center; margin-top: 1rem; font-size: 0.875rem; display: none; }
		.divider { display: flex; align-items: center; margin: 1.5rem 0; color: #999; font-size: 0.875rem; }
		.divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #ddd; }
		.divider::before { margin-right: 1rem; }
		.divider::after { margin-left: 1rem; }
		.oauth-buttons { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }
		.oauth-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; }
		.oauth-btn:hover { border-color: #0E838F; background: #f0fafa; }
		.oauth-btn .icon { font-size: 1.2rem; }
		.turnstile-container { margin: 1rem 0; display: flex; justify-content: center; }
		.link-group { text-align: center; margin-top: 1rem; }
		.link-group a { color: #0E838F; font-size: 0.875rem; text-decoration: none; margin: 0 0.5rem; }
		.link-group a:hover { text-decoration: underline; }
		.back-link { text-align: center; margin-top: 1rem; }
		.back-link a { color: #666; font-size: 0.875rem; text-decoration: none; }
		.back-link a:hover { text-decoration: underline; }
		.hidden-section { display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
	</style>
	${turnstileScript}
</head>
<body>
	<div class="auth-container">
		<h1>待办事项</h1>
		<p class="subtitle" id="authSubtitle">登录以开始使用</p>

		<!-- 登录表单 -->
		<form id="loginForm">
			<div class="form-group">
				<label>用户名</label>
				<input type="text" id="loginUsername" required />
			</div>
			<div class="form-group">
				<label>密码</label>
				<input type="password" id="loginPassword" required />
			</div>
			<div class="turnstile-container">${turnstileContainer("ts-login")}</div>
			<button type="submit" class="submit-btn">登录</button>
			<div class="link-group">
				${registrationEnabled ? `<a href="#" onclick="showRegisterForm(); return false;">注册账号</a>` : ""}
				<a href="#" onclick="showForgotForm(); return false;">忘记密码</a>
			</div>
		</form>

		${registrationEnabled ? `
		<!-- 注册表单 -->
		<form id="registerForm" style="display: none;">
			<div class="form-group">
				<label>用户名</label>
				<input type="text" id="regUsername" required />
			</div>
			<div class="form-group">
				<label>邮箱</label>
				<input type="email" id="regEmail" required />
			</div>
			<div class="form-group">
				<label>密码</label>
				<input type="password" id="regPassword" required minlength="6" />
			</div>
			<div class="form-group">
				<label>确认密码</label>
				<input type="password" id="regConfirmPassword" required />
			</div>
			<div class="turnstile-container">${turnstileContainer("ts-register")}</div>
			<button type="submit" class="submit-btn">发送验证码</button>
			<div class="back-link">
				<a href="#" onclick="showLoginForm(); return false;">已有账号？返回登录</a>
			</div>
		</form>

		<!-- 注册验证码表单 -->
		<div id="regVerifySection" class="hidden-section">
			<p style="text-align: center; color: #666; font-size: 0.875rem; margin-bottom: 1rem;">验证码已发送至您的邮箱，请输入验证码完成注册</p>
			<div class="form-group">
				<label>验证码</label>
				<input type="text" id="regCode" placeholder="6位验证码" maxlength="6" />
			</div>
			<button class="submit-btn" onclick="submitRegisterVerify()">完成注册</button>
			<div class="back-link">
				<a href="#" onclick="showRegisterForm(); return false;">返回上一步</a>
			</div>
		</div>
		` : ""}

		<!-- 忘记密码表单 -->
		<div id="forgotSection" class="hidden-section">
			<p style="text-align: center; color: #666; font-size: 0.875rem; margin-bottom: 1rem;">输入用户名，我们将发送验证码到您绑定的邮箱</p>
			<div class="form-group">
				<label>用户名</label>
				<input type="text" id="forgotUsername" placeholder="输入你的用户名" />
			</div>
			<div class="turnstile-container">${turnstileContainer("ts-forgot")}</div>
			<button class="submit-btn" onclick="sendForgotCode()">发送验证码</button>
			<div class="back-link">
				<a href="#" onclick="showLoginForm(); return false;">返回登录</a>
			</div>
		</div>

		<!-- 重置密码表单 -->
		<div id="resetCodeSection" class="hidden-section">
			<p style="text-align: center; color: #666; font-size: 0.875rem; margin-bottom: 1rem;">输入验证码和新密码</p>
			<div class="form-group">
				<label>验证码</label>
				<input type="text" id="resetCode" placeholder="6位验证码" maxlength="6" />
			</div>
			<div class="form-group">
				<label>新密码</label>
				<input type="password" id="resetNewPassword" placeholder="至少6位字符" minlength="6" />
			</div>
			<div class="form-group">
				<label>确认新密码</label>
				<input type="password" id="resetConfirmPassword" placeholder="再次输入新密码" />
			</div>
			<div class="turnstile-container">${turnstileContainer("ts-reset-code")}</div>
			<button class="submit-btn" onclick="submitResetPassword()">重置密码</button>
			<div class="back-link">
				<a href="#" onclick="showForgotForm(); return false;">返回上一步</a>
			</div>
		</div>

		${oauthProviders.length > 0 ? `<div class="divider">或使用以下方式登录</div><div class="oauth-buttons">${oauthProviders.map(p => `<button class="oauth-btn" onclick="oauthLogin('${p.key}')"><span class="icon">${p.icon}</span>${p.name}</button>`).join("")}</div>` : ""}
		<p class="error-msg" id="errorMsg"></p>
		<p class="success-msg" id="successMsg"></p>
	</div>
	<script>
		const turnstileSiteKey = ${turnstileSiteKey ? `"${turnstileSiteKey}"` : "null"};
		const registrationEnabled = ${registrationEnabled};
		const loginForm = document.getElementById("loginForm");
		const registerForm = document.getElementById("registerForm");
		const regVerifySection = document.getElementById("regVerifySection");
		const forgotSection = document.getElementById("forgotSection");
		const resetCodeSection = document.getElementById("resetCodeSection");
		const errorMsg = document.getElementById("errorMsg");
		const successMsg = document.getElementById("successMsg");
		const authSubtitle = document.getElementById("authSubtitle");
		let forgotUsernameCache = "";
		let regEmailCache = "";
		const turnstileWidgets = {};

		function renderTurnstileWidget(containerId) {
			if (!turnstileSiteKey || !window.turnstile) return;
			const el = document.getElementById(containerId);
			if (!el) return;
			if (turnstileWidgets[containerId] != null) {
				try { turnstile.remove(turnstileWidgets[containerId]); } catch(e) {}
			}
			turnstileWidgets[containerId] = turnstile.render(el, { sitekey: turnstileSiteKey, theme: "light" });
		}

		function getTurnstileToken(containerId) {
			if (!turnstileSiteKey) return undefined;
			if (turnstileWidgets[containerId] == null) return undefined;
			try { return turnstile.getResponse(turnstileWidgets[containerId]); } catch(e) { return undefined; }
		}

		function resetTurnstileWidget(containerId) {
			if (!turnstileSiteKey || turnstileWidgets[containerId] == null) return;
			try { turnstile.reset(turnstileWidgets[containerId]); } catch(e) {}
		}

		function onTurnstileLoad() {
			renderTurnstileWidget("ts-login");
		}

		function showError(msg) {
			errorMsg.textContent = msg;
			errorMsg.style.display = "block";
			successMsg.style.display = "none";
		}

		function showSuccess(msg) {
			successMsg.textContent = msg;
			successMsg.style.display = "block";
			errorMsg.style.display = "none";
		}

		function hideMessages() {
			errorMsg.style.display = "none";
			successMsg.style.display = "none";
		}

		function showLoginForm() {
			loginForm.style.display = "block";
			registerForm.style.display = "none";
			regVerifySection.style.display = "none";
			forgotSection.style.display = "none";
			resetCodeSection.style.display = "none";
			authSubtitle.textContent = "登录以开始使用";
			hideMessages();
			setTimeout(() => renderTurnstileWidget("ts-login"), 50);
		}

		function showRegisterForm() {
			if (!registrationEnabled) { showError("注册已关闭"); return; }
			loginForm.style.display = "none";
			registerForm.style.display = "block";
			regVerifySection.style.display = "none";
			forgotSection.style.display = "none";
			resetCodeSection.style.display = "none";
			authSubtitle.textContent = "注册新账号";
			hideMessages();
			setTimeout(() => renderTurnstileWidget("ts-register"), 50);
		}

		function showRegVerifyForm() {
			loginForm.style.display = "none";
			registerForm.style.display = "none";
			regVerifySection.style.display = "block";
			forgotSection.style.display = "none";
			resetCodeSection.style.display = "none";
			authSubtitle.textContent = "验证邮箱";
			hideMessages();
		}

		function showForgotForm() {
			loginForm.style.display = "none";
			registerForm.style.display = "none";
			regVerifySection.style.display = "none";
			forgotSection.style.display = "block";
			resetCodeSection.style.display = "none";
			authSubtitle.textContent = "重置密码";
			hideMessages();
			setTimeout(() => renderTurnstileWidget("ts-forgot"), 50);
		}

		function showResetCodeForm() {
			loginForm.style.display = "none";
			registerForm.style.display = "none";
			regVerifySection.style.display = "none";
			forgotSection.style.display = "none";
			resetCodeSection.style.display = "block";
			authSubtitle.textContent = "设置新密码";
			hideMessages();
			setTimeout(() => renderTurnstileWidget("ts-reset-code"), 50);
		}

		loginForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const turnstileToken = getTurnstileToken("ts-login");
			if (turnstileSiteKey && !turnstileToken) { showError("请完成人机验证"); return; }
			const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: document.getElementById("loginUsername").value, password: document.getElementById("loginPassword").value, turnstileToken }) });
			const data = await res.json();
			if (!res.ok) { showError(data.error); resetTurnstileWidget("ts-login"); return; }
			if (data.requireEmailBind) {
				window.location.href = "/profile";
				return;
			}
			window.location.href = "/";
		});

		registerForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const username = document.getElementById("regUsername").value.trim();
			const email = document.getElementById("regEmail").value.trim();
			const password = document.getElementById("regPassword").value;
			const confirm = document.getElementById("regConfirmPassword").value;
			if (!username || !password || !email) { showError("用户名、邮箱和密码不能为空"); return; }
			if (password.length < 6) { showError("密码长度至少6位"); return; }
			if (password !== confirm) { showError("两次输入的密码不一致"); return; }
			const turnstileToken = getTurnstileToken("ts-register");
			if (turnstileSiteKey && !turnstileToken) { showError("请完成人机验证"); return; }
			const res = await fetch("/api/auth/register/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password, email, turnstileToken }) });
			const data = await res.json();
			if (!res.ok) { showError(data.error); resetTurnstileWidget("ts-register"); return; }
			regEmailCache = email;
			showSuccess(data.message);
			setTimeout(showRegVerifyForm, 1500);
		});

		window.submitRegisterVerify = async function() {
			const code = document.getElementById("regCode").value.trim();
			if (!code) { showError("请输入验证码"); return; }
			const res = await fetch("/api/auth/register/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: regEmailCache, code }) });
			const data = await res.json();
			if (!res.ok) { showError(data.error); return; }
			showSuccess("注册成功！请登录");
			setTimeout(showLoginForm, 1500);
		};

		async function sendForgotCode() {
			const username = document.getElementById("forgotUsername").value.trim();
			if (!username) { showError("请输入用户名"); return; }
			const turnstileToken = getTurnstileToken("ts-forgot");
			if (turnstileSiteKey && !turnstileToken) { showError("请完成人机验证"); return; }
			const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, turnstileToken }) });
			const data = await res.json();
			if (!res.ok) { showError(data.error); resetTurnstileWidget("ts-forgot"); return; }
			forgotUsernameCache = username;
			showSuccess(data.message);
			setTimeout(showResetCodeForm, 1500);
		}

		async function submitResetPassword() {
			const code = document.getElementById("resetCode").value.trim();
			const newPassword = document.getElementById("resetNewPassword").value;
			const confirm = document.getElementById("resetConfirmPassword").value;
			if (!code || !newPassword) { showError("请填写完整信息"); return; }
			if (newPassword.length < 6) { showError("密码长度至少6位"); return; }
			if (newPassword !== confirm) { showError("两次输入的密码不一致"); return; }
			const turnstileToken = getTurnstileToken("ts-reset-code");
			if (turnstileSiteKey && !turnstileToken) { showError("请完成人机验证"); return; }
			const res = await fetch("/api/auth/reset-password-by-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: forgotUsernameCache, code, newPassword, turnstileToken }) });
			const data = await res.json();
			if (!res.ok) { showError(data.error); resetTurnstileWidget("ts-reset-code"); return; }
			showSuccess("密码重置成功！请登录");
			setTimeout(showLoginForm, 1500);
		}

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
		<p class="subtitle">创建管理员账号或配置 OAuth 登录方式</p>
		<form id="setupForm">
			<div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem; border: 1px solid #eee; border-radius: 8px;">
				<h2 style="font-size: 1.1rem; margin-bottom: 1rem; color: #333;">创建管理员账号</h2>
				<div class="form-group">
					<label>用户名</label>
					<input type="text" name="admin_username" placeholder="输入管理员用户名" />
				</div>
				<div class="form-group">
					<label>密码</label>
					<input type="password" name="admin_password" placeholder="至少6位字符" />
				</div>
			</div>
			<div class="divider" style="margin: 1.5rem 0;">或配置 OAuth 登录（可选）</div>
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
			const hasLocalAdmin = data.admin_username && data.admin_password;
			if (!hasProvider && !hasLocalAdmin) {
				showMsg("请创建管理员账号或配置至少一个 OAuth 提供商", "error");
				submitBtn.disabled = false;
				submitBtn.textContent = "保存并前往登录";
				return;
			}

			const res = await fetch("/api/setup", {
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
			msgBox.style.display = "block";
			const container = document.getElementById("toastContainer");
			const toast = document.createElement("div");
			toast.className = "toast " + type;
			toast.textContent = text;
			container.appendChild(toast);
			requestAnimationFrame(() => {
				toast.classList.add("show");
			});
			setTimeout(() => {
				toast.classList.remove("show");
				setTimeout(() => { toast.remove(); }, 300);
			}, 3000);
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
		.todo-item { background: white; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
		.todo-row { display: flex; align-items: center; gap: 1rem; padding: 1rem; }
		.todo-item.completed .todo-title { text-decoration: line-through; color: #999; }
		.todo-row input[type="checkbox"] { width: 20px; height: 20px; accent-color: #0E838F; pointer-events: none; }
		.todo-title { flex: 1; font-size: 1rem; color: #333; }
		.steps-container { padding: 0 1rem 1rem 1rem; }
		.steps-inner { padding: 0.75rem; background: #f9f9f9; border-radius: 6px; border-left: 3px solid #9c27b0; }
		.steps-header h4 { color: #9c27b0; font-size: 0.875rem; margin-bottom: 0.5rem; }
		.step-list { list-style: none; }
		.step-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0; }
		.step-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: #9c27b0; pointer-events: none; }
		.step-item.completed .step-title { text-decoration: line-through; color: #999; }
		.step-title { font-size: 0.875rem; }
		.empty-state { text-align: center; color: #999; padding: 3rem 0; }
		.todo-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; padding: 0 1rem 0.75rem; }
		.tag-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; color: white; }
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
		let allPublicTags = [];

		async function fetchTodos() {
			const [todosRes, tagsRes] = await Promise.all([
				fetch(\`/api/public/todos?username=${escapeHtml(username)}\`),
				fetch(\`/api/public/tags?username=${escapeHtml(username)}\`)
			]);
			const todosData = await todosRes.json();
			if (!todosRes.ok) { todoList.innerHTML = '<li class="empty-state">' + todosData.error + '</li>'; return; }
			allPublicTags = tagsRes.ok ? await tagsRes.json() : [];
			const todosWithTags = await Promise.all(todosData.todos.map(async (todo) => {
				const tagsRes = await fetch(\`/api/public/todo-tags?username=${escapeHtml(username)}&todo_id=\${todo.id}\`);
				const tags = tagsRes.ok ? await tagsRes.json() : [];
				return { ...todo, tags };
			}));
			renderTodos(todosWithTags);
		}

		function renderTodos(todos) {
			if (todos.length === 0) {
				todoList.innerHTML = '<li class="empty-state">暂无公开的待办事项</li>';
				return;
			}
			todoList.innerHTML = todos.map(todo => {
				const tagsHtml = (todo.tags || []).map(tag => \`
					<span class="tag-badge" style="background: \${tag.color}" title="\${escapeHtml(tag.name)}">\${escapeHtml(tag.name)}</span>
				\`).join("");
				const stepsHtml = todo.steps && todo.steps.length > 0 ? \`
					<div class="steps-container">
						<div class="steps-inner">
							<div class="steps-header"><h4>步骤</h4></div>
							<ul class="step-list">
								\${todo.steps.map(step => \`
									<li class="step-item \${step.completed ? 'completed' : ''}">
										<input type="checkbox" \${step.completed ? 'checked' : ''} disabled />
										<span class="step-title">\${escapeHtml(step.title)}</span>
									</li>
								\`).join("")}
							</ul>
						</div>
					</div>
				\` : '';
				return \`
					<li class="todo-item \${todo.completed ? 'completed' : ''}">
						<div class="todo-row">
							<input type="checkbox" \${todo.completed ? 'checked' : ''} disabled />
							<span class="todo-title">\${escapeHtml(todo.title)}</span>
						</div>
						<div class="todo-tags">\${tagsHtml}</div>
						\${stepsHtml}
					</li>
				\`;
			}).join("");
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

export function renderPasswordResetPage(token: string, turnstileSiteKey: string) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>重置密码 - 待办事项</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
		.reset-container { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
		h1 { text-align: center; color: #333; margin-bottom: 0.5rem; }
		.subtitle { text-align: center; color: #666; margin-bottom: 2rem; font-size: 0.875rem; }
		.form-group { margin-bottom: 1rem; }
		.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-size: 0.875rem; }
		.form-group input { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
		.form-group input:focus { outline: none; border-color: #0E838F; }
		.submit-btn { width: 100%; padding: 0.75rem; background: #0E838F; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 1rem; transition: background 0.2s; }
		.submit-btn:hover { background: #0b6b6b; }
		.error-msg { color: #ff4d4f; text-align: center; margin-top: 1rem; font-size: 0.875rem; display: none; }
		.success-msg { color: #1e7e34; text-align: center; margin-top: 1rem; font-size: 0.875rem; display: none; }
		.password-strength { height: 4px; border-radius: 2px; margin-top: 0.5rem; background: #eee; }
		.password-strength .bar { height: 100%; border-radius: 2px; transition: all 0.3s; }
		.password-strength .weak { width: 33%; background: #ff4d4f; }
		.password-strength .medium { width: 66%; background: #faad14; }
		.password-strength .strong { width: 100%; background: #52c41a; }
	</style>
	${turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad" defer></script>' : ""}
</head>
<body>
	<div class="reset-container">
		<h1>重置密码</h1>
		<p class="subtitle">通过 OAuth 验证身份后设置新密码</p>
		<form id="resetForm">
			<div class="form-group">
				<label>新密码</label>
				<input type="password" id="newPassword" required minlength="6" />
				<div class="password-strength"><div class="bar" id="strengthBar"></div></div>
			</div>
			<div class="form-group">
				<label>确认密码</label>
				<input type="password" id="confirmPassword" required />
			</div>
			${turnstileSiteKey ? `<div class="turnstile-container"><div id="ts-reset"></div></div>` : ""}
			<button type="submit" class="submit-btn">设置新密码</button>
		</form>
		<p class="error-msg" id="errorMsg"></p>
		<p class="success-msg" id="successMsg"></p>
	</div>
	<script>
		const turnstileSiteKey = ${turnstileSiteKey ? `"${turnstileSiteKey}"` : "null"};
		const resetForm = document.getElementById("resetForm");
		const errorMsg = document.getElementById("errorMsg");
		const successMsg = document.getElementById("successMsg");
		const newPassword = document.getElementById("newPassword");
		const confirmPassword = document.getElementById("confirmPassword");
		const strengthBar = document.getElementById("strengthBar");
		const token = "${escapeHtml(token)}";
		const turnstileWidgets = {};

		function renderTurnstileWidget(containerId) {
			if (!turnstileSiteKey || !window.turnstile) return;
			const el = document.getElementById(containerId);
			if (!el) return;
			if (turnstileWidgets[containerId] != null) {
				try { turnstile.remove(turnstileWidgets[containerId]); } catch(e) {}
			}
			turnstileWidgets[containerId] = turnstile.render(el, { sitekey: turnstileSiteKey, theme: "light" });
		}

		function getTurnstileToken(containerId) {
			if (!turnstileSiteKey || turnstileWidgets[containerId] == null) return undefined;
			try { return turnstile.getResponse(turnstileWidgets[containerId]); } catch(e) { return undefined; }
		}

		function resetTurnstileWidget(containerId) {
			if (!turnstileSiteKey || turnstileWidgets[containerId] == null) return;
			try { turnstile.reset(turnstileWidgets[containerId]); } catch(e) {}
		}

		function onTurnstileLoad() {
			renderTurnstileWidget("ts-reset");
		}

		newPassword.addEventListener("input", () => {
			const val = newPassword.value;
			let strength = 0;
			if (val.length >= 6) strength++;
			if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
			if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) strength++;
			strengthBar.className = "bar " + (strength === 1 ? "weak" : strength === 2 ? "medium" : strength >= 3 ? "strong" : "");
		});

		resetForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			errorMsg.style.display = "none";
			successMsg.style.display = "none";

			const pw = newPassword.value;
			const confirm = confirmPassword.value;
			if (pw !== confirm) { showError("两次输入的密码不一致"); return; }
			if (pw.length < 6) { showError("密码长度至少6位"); return; }
			const turnstileToken = getTurnstileToken("ts-reset");
			if (turnstileSiteKey && !turnstileToken) { showError("请完成人机验证"); return; }

			const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, newPassword: pw, turnstileToken }) });
			const data = await res.json();
			if (!res.ok) { showError(data.error); resetTurnstileWidget("ts-reset"); return; }
			successMsg.textContent = "密码重置成功！正在跳转至登录页...";
			successMsg.style.display = "block";
			setTimeout(() => { window.location.href = "/"; }, 2000);
		});

		function showError(msg) {
			errorMsg.textContent = msg;
			errorMsg.style.display = "block";
		}
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
		.toast-container { position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 2000; display: flex; flex-direction: column; gap: 0.5rem; align-items: center; pointer-events: none; }
		.toast { padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.875rem; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); opacity: 0; transform: translateY(-1rem); transition: all 0.3s ease; pointer-events: auto; max-width: 400px; text-align: center; }
		.toast.show { opacity: 1; transform: translateY(0); }
		.toast.success { background: #52c41a; }
		.toast.error { background: #ff4d4f; }
	</style>
</head>
<body>
	<div class="toast-container" id="toastContainer"></div>
	<div class="container">
		<div class="header">
			<h1>系统设置</h1>
			<div>
				<a class="back-btn" href="/admin" style="margin-right: 0.5rem; background: #666;">用户管理</a>
				<a class="back-btn" href="/">返回待办</a>
			</div>
		</div>
		<div id="msgBox" class="msg" style="display: none;"></div>
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
			<h2>邮件服务配置（SMTP）</h2>
			<form id="smtpForm">
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

		async function loadSettings() {
			const res = await fetch("/api/admin/settings");
			if (!res.ok) { window.location.href = "/"; return; }
			const s = await res.json();
			regToggle.checked = s.registration_enabled === "true";
			emailVerifyToggle.checked = s.email_verification_required === "true";
			document.getElementById("smtpHost").value = s.smtp_host || "";
			document.getElementById("smtpPort").value = s.smtp_port || "";
			document.getElementById("smtpUser").value = s.smtp_user || "";
			document.getElementById("smtpPass").value = "";
			document.getElementById("smtpFrom").value = s.smtp_from || "";
			document.getElementById("testRecipient").value = s.test_email_recipient || "";

			oauthProviders.forEach(p => {
				p.fields.forEach(f => {
					const el = document.getElementById(\`oauth_\${p.key}_\${f}\`);
					if (el) el.value = s[\`oauth_\${p.key}_\${f}\`] || "";
				});
			});

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
				smtp_host: document.getElementById("smtpHost").value.trim(),
				smtp_port: document.getElementById("smtpPort").value.trim(),
				smtp_user: document.getElementById("smtpUser").value.trim(),
				smtp_pass: document.getElementById("smtpPass").value.trim(),
				smtp_from: document.getElementById("smtpFrom").value.trim(),
				test_email_recipient: document.getElementById("testRecipient").value.trim(),
			};
			const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
			const result = await res.json();
			if (!res.ok) { showMsg(result.error, "error"); return; }
			showMsg("SMTP 配置已保存", "success");
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
			const container = document.getElementById("toastContainer");
			const toast = document.createElement("div");
			toast.className = "toast " + type;
			toast.textContent = text;
			container.appendChild(toast);
			requestAnimationFrame(() => {
				toast.classList.add("show");
			});
			setTimeout(() => {
				toast.classList.remove("show");
				setTimeout(() => { toast.remove(); }, 300);
			}, 3000);
		}

		loadSettings();
	</script>
</body>
</html>`;
}

export function renderProfilePage(username: string, email: string | null, emailVerified: boolean, hasPassword: boolean, turnstileSiteKey: string) {
	const verifiedBadge = emailVerified ? '<span style="color: #1e7e34; font-size: 0.75rem;">已验证</span>' : '<span style="color: #c53030; font-size: 0.75rem;">未验证</span>';
	const emailDisplay = email || "未绑定";
	const passwordStatus = hasPassword ? '<span style="color: #1e7e34; font-size: 0.75rem;">已设置</span>' : '<span style="color: #c53030; font-size: 0.75rem;">未设置</span>';
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
		.turnstile-container { margin: 1rem 0; display: flex; justify-content: center; }
	</style>
	${turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad" defer></script>' : ""}
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
			<div class="info-row">
				<span class="info-label">密码</span>
				<span class="info-value">${passwordStatus}</span>
			</div>
		</div>
		<div class="card">
			<h2 style="margin-bottom: 1rem;">修改密码</h2>
			<form id="passwordForm">
				<div class="form-group">
					<label>当前密码</label>
					<input type="password" id="currentPassword" placeholder="输入当前密码" />
				</div>
				<div class="form-group">
					<label>新密码</label>
					<input type="password" id="newPassword" placeholder="输入新密码（至少6位）" />
				</div>
				<div class="form-group">
					<label>确认新密码</label>
					<input type="password" id="confirmNewPassword" placeholder="再次输入新密码" />
				</div>
				<button type="submit" class="btn btn-primary">修改密码</button>
			</form>
		</div>
		<div class="card">
			<h2 style="margin-bottom: 1rem;">绑定邮箱</h2>
			<form id="emailForm">
				<div class="form-group">
					<label>邮箱地址</label>
					<input type="email" id="emailInput" placeholder="your@email.com" value="${email ? escapeHtml(email) : ""}" />
				</div>
				${turnstileSiteKey ? `<div class="turnstile-container"><div id="ts-email"></div></div>` : ""}
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
		const passwordForm = document.getElementById("passwordForm");
		const emailInput = document.getElementById("emailInput");
		const verifySection = document.getElementById("verifySection");
		const msgBox = document.getElementById("msgBox");
		let currentEmail = "";
		const turnstileSiteKey = ${turnstileSiteKey ? `"${turnstileSiteKey}"` : "null"};
		const turnstileWidgets = {};

		function renderTurnstileWidget(containerId) {
			if (!turnstileSiteKey || !window.turnstile) return;
			const el = document.getElementById(containerId);
			if (!el) return;
			if (turnstileWidgets[containerId] != null) {
				try { turnstile.remove(turnstileWidgets[containerId]); } catch(e) {}
			}
			turnstileWidgets[containerId] = turnstile.render(el, { sitekey: turnstileSiteKey, theme: "light" });
		}

		function getTurnstileToken(containerId) {
			if (!turnstileSiteKey || turnstileWidgets[containerId] == null) return undefined;
			try { return turnstile.getResponse(turnstileWidgets[containerId]); } catch(e) { return undefined; }
		}

		function resetTurnstileWidget(containerId) {
			if (!turnstileSiteKey || turnstileWidgets[containerId] == null) return;
			try { turnstile.reset(turnstileWidgets[containerId]); } catch(e) {}
		}

		function onTurnstileLoad() {
			renderTurnstileWidget("ts-email");
		}

		passwordForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const currentPassword = document.getElementById("currentPassword").value;
			const newPassword = document.getElementById("newPassword").value;
			const confirmNewPassword = document.getElementById("confirmNewPassword").value;
			if (!currentPassword) { showMsg("请输入当前密码", "error"); return; }
			if (newPassword.length < 6) { showMsg("新密码长度至少6位", "error"); return; }
			if (newPassword !== confirmNewPassword) { showMsg("两次输入的新密码不一致", "error"); return; }
			const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
			const data = await res.json();
			if (!res.ok) { showMsg(data.error, "error"); return; }
			showMsg("密码修改成功", "success");
			passwordForm.reset();
		});

		emailForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const email = emailInput.value.trim();
			if (!email || !email.includes("@")) { showMsg("请输入有效的邮箱地址", "error"); return; }
			currentEmail = email;
			const turnstileToken = getTurnstileToken("ts-email");
			if (turnstileSiteKey && !turnstileToken) { showMsg("请完成人机验证", "error"); return; }
			const res = await fetch("/api/email/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, turnstileToken }) });
			const data = await res.json();
			if (!res.ok) { showMsg(data.error, "error"); resetTurnstileWidget("ts-email"); return; }
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
