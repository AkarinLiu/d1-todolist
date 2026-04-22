export function renderHtml(username: string, isAdmin: boolean) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>待办事项 - ${username}</title>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		.todo-item.completed .todo-title { text-decoration: line-through; color: #999; }
		.step-item.completed .step-title { text-decoration: line-through; color: #999; }
		.filter-item:hover { color: #0E838F; }
		.filter-item.active { color: #0E838F; font-weight: 600; }
		.filter-group-header:hover { color: #0E838F; }
		.tag-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; color: white; cursor: pointer; }
		.tag-badge:hover { opacity: 0.8; }
		.tag-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
		.tag-modal { background: white; border-radius: 12px; padding: 1.5rem; width: 90%; max-width: 400px; max-height: 80vh; overflow-y: auto; }
		.tag-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 6px; cursor: pointer; }
		.tag-option:hover { background: #f5f5f5; }
		.tag-option.selected { background: #e8f8f8; }
		.group-label { font-size: 0.75rem; color: #999; margin-top: 0.75rem; margin-bottom: 0.25rem; font-weight: 600; }
		.tag-actions { display: flex; gap: 0.15rem; opacity: 0; transition: opacity 0.2s; }
		.filter-item:hover .tag-actions { opacity: 1; }
		.tag-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
		.group-actions { display: flex; gap: 0.25rem; }
		.add-group-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 0.4rem; border: 1px dashed #ccc; border-radius: 6px; background: transparent; color: #999; cursor: pointer; font-size: 0.8rem; margin-top: 0.5rem; transition: all 0.2s; }
		.add-group-btn:hover { border-color: #0E838F; color: #0E838F; background: #f0fafa; }
		.filter-group-items { padding-left: 1rem; }
		.public-group-toggle { padding: 0.2rem 0.4rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.65rem; background: #e8e8e8; color: #666; transition: all 0.2s; }
		.public-group-toggle.active { background: #0E838F; color: white; }
		/* Mobile sidebar toggle */
		.sidebar-toggle { display: none; }
		.sidebar-overlay { display: none; }
		@media (max-width: 768px) {
			.sidebar-toggle { display: flex; position: fixed; bottom: 1.5rem; right: 1.5rem; width: 56px; height: 56px; border-radius: 50%; background: #0E838F; color: white; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 100; align-items: center; justify-content: center; font-size: 1.5rem; cursor: pointer; }
			.sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: white; z-index: 101; transform: translateX(-100%); transition: transform 0.3s ease; overflow-y: auto; padding: 1rem; }
			.sidebar.open { transform: translateX(0); }
			.sidebar-overlay { display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
			.sidebar-overlay.open { opacity: 1; visibility: visible; }
			.main-content { width: 100%; padding: 0.75rem !important; }
			.todo-buttons { flex-wrap: wrap; gap: 0.25rem; }
			.todo-buttons .button { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
			.header-level { flex-direction: column; align-items: flex-start !important; gap: 0.75rem; }
			.header-level .level-right { width: 100%; }
			.header-level .buttons { flex-wrap: wrap; gap: 0.25rem; }
			.todo-title { font-size: 0.95rem; }
			.filter-item .tag-actions { opacity: 1; }
		}
	</style>
</head>
<body class="has-background-light">
	<button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="打开筛选">☰</button>
	<div class="sidebar-overlay" onclick="toggleSidebar()"></div>
	<div class="columns is-gapless" style="min-height: 100vh; margin: 0;">
		<div class="column is-3-desktop is-4-tablet p-4 sidebar" id="sidebar">
			<aside class="menu">
				<div class="is-flex is-justify-content-space-between is-align-items-center mb-3 is-hidden-desktop">
					<span class="has-text-weight-semibold">筛选与分组</span>
					<button class="button is-small is-light" onclick="toggleSidebar()">✕</button>
				</div>
				<div class="box">
					<p class="menu-label">筛选</p>
					<ul class="menu-list">
						<li><a class="filter-item active" data-filter="all" onclick="setFilter('all')">全部</a></li>
					</ul>
					<div id="tagFilters"></div>
				</div>
				<div class="box">
					<p class="menu-label">标签分组</p>
					<div id="groupFilters"></div>
					<button class="add-group-btn" onclick="showAddGroupInput()">+ 新建分组</button>
					<div id="addGroupForm" style="display: none;"></div>
				</div>
			</aside>
		</div>
		<div class="column p-4 main-content">
			<section class="section" style="padding: 1.5rem 0.75rem;">
				<div class="level mb-5 header-level">
					<div class="level-left">
						<h1 class="title is-3">待办事项</h1>
					</div>
					<div class="level-right">
						<div class="buttons">
							<span class="tag is-info is-light is-medium">${escapeHtml(username)}</span>
							<a class="button is-link is-small" href="/profile">个人资料</a>
							${isAdmin ? '<a class="button is-warning is-small" href="/admin">管理用户</a>' : ''}
							<button class="button is-dark is-small" onclick="logout()">退出登录</button>
						</div>
					</div>
				</div>
				<form id="addForm" class="field has-addons mb-5">
					<div class="control is-expanded">
						<input type="text" id="todoInput" class="input" placeholder="输入新的待办事项..." required />
					</div>
					<div class="control">
						<button type="submit" class="button is-primary">添加</button>
					</div>
				</form>
				<ul id="todoList" class="box is-shadowless" style="background: transparent; padding: 0;"></ul>
				<div class="notification is-info is-light has-text-centered mt-5">
					<p>公开分享链接：<code id="shareUrl" class="is-size-6"></code></p>
				</div>
			</section>
		</div>
	</div>
	<div class="tag-modal-overlay" id="tagModal" style="display: none;">
		<div class="tag-modal">
			<h3 class="title is-5">管理标签</h3>
			<div id="tagOptions"></div>
			<div class="field has-addons mt-4 is-flex-wrap-wrap">
				<div class="control is-expanded">
					<input type="text" id="newTagInput" class="input is-small" placeholder="输入新标签名称..." />
				</div>
				<div class="control">
					<input type="color" id="newTagColor" class="input is-small" value="#0E838F" title="选择颜色" style="width: 50px; padding: 2px;" />
				</div>
				<div class="control">
					<div class="select is-small">
						<select id="newTagGroup"><option value="">无分组</option></select>
					</div>
				</div>
				<div class="control">
					<button onclick="createNewTag()" class="button is-success is-small">创建</button>
				</div>
			</div>
			<button onclick="closeTagModal()" class="button is-dark is-fullwidth mt-4">关闭</button>
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
		let lastSyncTime = 0;
		const SYNC_INTERVAL = 30000;
		let syncIntervalId = null;
		const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("todo_sync") : null;

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
			lastSyncTime = Date.now();
		}

		function notifyOtherTabs() {
			if (bc) {
				bc.postMessage({ type: "sync", timestamp: Date.now() });
			}
		}

		function startAutoSync() {
			if (syncIntervalId) clearInterval(syncIntervalId);
			syncIntervalId = setInterval(() => {
				if (document.hidden) return;
				fetchData();
			}, SYNC_INTERVAL);
		}

		function stopAutoSync() {
			if (syncIntervalId) {
				clearInterval(syncIntervalId);
				syncIntervalId = null;
			}
		}

		if (bc) {
			bc.onmessage = (event) => {
				if (event.data && event.data.type === "sync") {
					const timeSinceLastSync = Date.now() - lastSyncTime;
					if (timeSinceLastSync > 5000) {
						fetchData();
					}
				}
			};
		}

		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				const timeSinceLastSync = Date.now() - lastSyncTime;
				if (timeSinceLastSync > 5000) {
					fetchData();
				}
			}
		});

		function renderFilters() {
			tagFilters.innerHTML = allTags.map(tag => {
				const groupOptions = allGroups.map(g => \`<option value="\${g.id}" \${tag.group_id === g.id ? 'selected' : ''}>\${escapeHtml(g.name)}</option>\`).join("");
				return \`
					<a class="filter-item panel-block is-size-7" data-filter="tag" data-id="\${tag.id}" onclick="setFilter('tag', \${tag.id})">
						<span class="tag-dot mr-2" style="background: \${tag.color}"></span>
						<span class="is-flex-grow-1">\${escapeHtml(tag.name)}</span>
						<span class="tag-actions">
							<input type="color" value="\${tag.color}" onclick="event.stopPropagation()" onchange="changeTagColor(\${tag.id}, this.value)" title="修改颜色" class="is-small" style="width: 24px; height: 24px; padding: 0;" />
							<div class="select is-small" onclick="event.stopPropagation()">
								<select onchange="changeTagGroup(\${tag.id}, this.value)">
									<option value="">无分组</option>
									\${groupOptions}
								</select>
							</div>
							<button class="button is-small is-white has-text-danger" onclick="event.stopPropagation();deleteTag(\${tag.id})">
								<span class="icon">✕</span>
							</button>
						</span>
					</a>
				\`;
			}).join("");

			groupFilters.innerHTML = allGroups.map(group => {
				const groupTags = allTags.filter(t => t.group_id === group.id);
				const tagsHtml = groupTags.map(tag => \`
					<a class="filter-item panel-block is-size-7" data-filter="tag" data-id="\${tag.id}" onclick="setFilter('tag', \${tag.id})">
						<span class="tag-dot mr-2" style="background: \${tag.color}"></span>
						<span>\${escapeHtml(tag.name)}</span>
					</a>
				\`).join("");
				const isEditing = editingGroupId === group.id;
				const nameHtml = isEditing
					? \`<input type="text" id="editGroupInput-\${group.id}" value="\${escapeHtml(group.name)}" class="input is-small is-flex-grow-1 mr-2" onclick="event.stopPropagation()" onkeydown="if(event.key==='Enter')saveGroupEdit(\${group.id})" />\`
					: \`<span>\${escapeHtml(group.name)}</span>\`;
				const actionsHtml = isEditing
					? \`<span class="group-actions">
							<button class="button is-small is-white has-text-success" onclick="event.stopPropagation();saveGroupEdit(\${group.id})">✓</button>
							<button class="button is-small is-white" onclick="event.stopPropagation();cancelGroupEdit()">✗</button>
						</span>\`
					: \`<span class="group-actions">
							<button class="public-group-toggle \${group.is_public ? 'active' : ''}" onclick="event.stopPropagation();toggleGroupPublic(\${group.id}, \${group.is_public})" title="\${group.is_public ? '公开' : '私有'}">\${group.is_public ? '公开' : '私有'}</button>
							<button class="button is-small is-white" onclick="event.stopPropagation();startGroupEdit(\${group.id})">✎</button>
							<button class="button is-small is-white has-text-danger" onclick="event.stopPropagation();deleteGroup(\${group.id})">✕</button>
						</span>\`;
				return \`
					<div class="mb-2">
						<div class="filter-group-header is-flex is-justify-content-space-between is-align-items-center is-clickable mb-1" onclick="setFilter('group', \${group.id})">
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
			form.innerHTML = \`<div class="field has-addons mt-2">
				<div class="control is-expanded">
					<input type="text" id="newGroupInput" class="input is-small" placeholder="分组名称..." onkeydown="if(event.key==='Enter')createGroup()" />
				</div>
				<div class="control">
					<button class="button is-small is-primary" onclick="createGroup()">✓</button>
				</div>
				<div class="control">
					<button class="button is-small is-light" onclick="hideAddGroupInput()">✗</button>
				</div>
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
				notifyOtherTabs();
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
				notifyOtherTabs();
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
				notifyOtherTabs();
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
				notifyOtherTabs();
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
				notifyOtherTabs();
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
				notifyOtherTabs();
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
				notifyOtherTabs();
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
				todoList.innerHTML = '<li class="has-text-centered has-text-grey py-6">暂无待办事项，添加一个吧！</li>';
				return;
			}
			todoList.innerHTML = filtered.map(todo => {
				const tagsHtml = (todo.tags || []).map(tag => \`
					<span class="tag-badge" style="background: \${tag.color}" title="\${escapeHtml(tag.name)}">\${escapeHtml(tag.name)}</span>
				\`).join("");
				const hasNotes = todo.notes && todo.notes.trim() !== "";
				return \`
					<li class="todo-item \${todo.completed ? 'completed' : ''} box mb-3" data-id="\${todo.id}">
						<div class="is-flex is-align-items-center is-flex-wrap-wrap gap-2" style="min-width: 0;">
							<label class="checkbox mr-2">
								<input type="checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${todo.id}, this.checked)" />
							</label>
							<span class="todo-title is-flex-grow-1" style="min-width: 0; overflow-wrap: break-word;">\${escapeHtml(todo.title)}</span>
						</div>
						<div class="buttons are-small todo-buttons mt-2">
							<button class="button is-success" onclick="openTagModal(\${todo.id})">标签</button>
							<button class="button is-link" onclick="toggleSteps(\${todo.id})">步骤</button>
							<button class="button is-warning" onclick="toggleNotes(\${todo.id})">\${hasNotes ? '编辑备注' : '添加备注'}</button>
							<button class="button \${todo.is_public ? 'is-primary' : 'is-light'}" onclick="togglePublic(\${todo.id}, \${todo.is_public})">\${todo.is_public ? '公开' : '私有'}</button>
							<button class="button is-danger" onclick="deleteTodo(\${todo.id})">删除</button>
						</div>
						<div class="mt-2">\${tagsHtml}</div>
						<div id="steps-\${todo.id}" style="display: none;" class="mt-3">
							<div class="notification is-light" style="border-left: 3px solid #9c27b0;">
								<p class="has-text-weight-semibold has-text-link">步骤</p>
								<div class="field has-addons mt-2">
									<div class="control is-expanded">
										<input type="text" id="stepInput-\${todo.id}" class="input is-small" placeholder="添加步骤..." />
									</div>
									<div class="control">
										<button onclick="addStep(\${todo.id})" class="button is-link is-small">添加</button>
									</div>
								</div>
								<ul id="stepList-\${todo.id}" class="mt-2"></ul>
							</div>
						</div>
						<div id="notes-\${todo.id}" style="display: none;" class="mt-3">
							<div class="notification is-warning is-light" style="border-left: 3px solid #ff9800;">
								<p class="has-text-weight-semibold">备注</p>
								<div id="notesContent-\${todo.id}" class="mt-2">
									\${hasNotes ? \`<div class="content box is-small">\${todo.notes_html}</div>\` : '<p class="has-text-grey-light is-italic">暂无备注</p>'}
								</div>
								<div id="notesActions-\${todo.id}" class="buttons are-small mt-2">
									<button class="button is-warning" onclick="editNotes(\${todo.id})">编辑</button>
								</div>
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
						<span class="tag-dot" style="background: \${tag.color}"></span>
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
							<span class="tag-dot" style="background: \${tag.color}"></span>
							<span>\${escapeHtml(tag.name)}</span>
						</label>\`;
					});
				}
			});

			if (allTags.length === 0) {
				html = '<p class="has-text-grey is-size-7">暂无标签，请在下方创建</p>';
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
			notifyOtherTabs();
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
				notifyOtherTabs();
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
			await fetchData();
			notifyOtherTabs();
		});

		window.toggleTodo = async (id, completed) => {
			await fetch(\`/api/todos/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) });
			await fetchData();
			notifyOtherTabs();
		};

		window.deleteTodo = async (id) => {
			await fetch(\`/api/todos/\${id}\`, { method: "DELETE" });
			await fetchData();
			notifyOtherTabs();
		};

		window.togglePublic = async (id, current) => {
			await fetch("/api/todos/toggle-public", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isPublic: !current }) });
			await fetchData();
			notifyOtherTabs();
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
				stepList.innerHTML = '<li class="has-text-grey is-size-7 py-2">暂无步骤</li>';
				return;
			}
			stepList.innerHTML = steps.map(step => \`
				<li class="step-item \${step.completed ? 'completed' : ''} is-flex is-align-items-center mb-2" data-id="\${step.id}">
					<label class="checkbox mr-2">
						<input type="checkbox" \${step.completed ? 'checked' : ''} onchange="toggleStep(\${todoId}, \${step.id}, this.checked)" />
					</label>
					<span class="step-title is-flex-grow-1 is-size-7">\${escapeHtml(step.title)}</span>
					<button class="button is-small is-danger is-light" onclick="deleteStep(\${todoId}, \${step.id})">删除</button>
				</li>
			\`).join("");
		}

		window.addStep = async (todoId) => {
			const input = document.getElementById("stepInput-" + todoId);
			const title = input.value.trim();
			if (!title) return;
			await fetch("/api/todos/" + todoId + "/steps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
			input.value = "";
			await fetchSteps(todoId);
			notifyOtherTabs();
		};

		window.toggleStep = async (todoId, stepId, completed) => {
			await fetch("/api/todos/" + todoId + "/steps/" + stepId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) });
			await fetchSteps(todoId);
			notifyOtherTabs();
		};

		window.deleteStep = async (todoId, stepId) => {
			await fetch("/api/todos/" + todoId + "/steps/" + stepId, { method: "DELETE" });
			await fetchSteps(todoId);
			notifyOtherTabs();
		};

		window.toggleNotes = (todoId) => {
			const notesContainer = document.getElementById("notes-" + todoId);
			if (notesContainer.style.display === "none") {
				notesContainer.style.display = "block";
			} else {
				notesContainer.style.display = "none";
			}
		};

		window.editNotes = (todoId) => {
			const todo = allTodos.find(t => t.id === todoId);
			const currentNotes = todo?.notes || "";
			const contentDiv = document.getElementById("notesContent-" + todoId);
			const actionsDiv = document.getElementById("notesActions-" + todoId);

			contentDiv.innerHTML = \`<textarea class="textarea is-family-monospace is-small" id="notesTextarea-\${todoId}" placeholder="输入 Markdown 格式的备注..." rows="5">\${escapeHtml(currentNotes)}</textarea>\`;
			actionsDiv.innerHTML = \`
				<button class="button is-success is-small" onclick="saveNotes(\${todoId})">保存</button>
				<button class="button is-light is-small" onclick="cancelEditNotes(\${todoId})">取消</button>
			\`;
		};

		window.saveNotes = async (todoId) => {
			const textarea = document.getElementById("notesTextarea-" + todoId);
			const notes = textarea.value.trim();
			const res = await fetch("/api/todos/" + todoId, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ notes })
			});
			if (res.ok) {
				await fetchData();
				notifyOtherTabs();
			}
		};

		window.cancelEditNotes = (todoId) => {
			const todo = allTodos.find(t => t.id === todoId);
			const hasNotes = todo?.notes && todo.notes.trim() !== "";
			const contentDiv = document.getElementById("notesContent-" + todoId);
			const actionsDiv = document.getElementById("notesActions-" + todoId);

			contentDiv.innerHTML = hasNotes
				? \`<div class="content box is-small">\${todo.notes_html}</div>\`
				: '<p class="has-text-grey-light is-italic">暂无备注</p>';
			actionsDiv.innerHTML = \`<button class="button is-warning is-small" onclick="editNotes(\${todoId})">编辑</button>\`;
		};

		async function logout() {
			await fetch("/api/auth/logout", { method: "POST" });
			window.location.href = "/";
		}

		window.toggleSidebar = function() {
			document.getElementById("sidebar").classList.toggle("open");
			document.querySelector(".sidebar-overlay").classList.toggle("open");
		};

		fetchData();
		startAutoSync();
	</script>
</body>
</html>`;
}

export function renderAuthPage(oauthProviders: Array<{ key: string; name: string; icon: string }>, turnstileSiteKey: string, registrationEnabled: boolean, emailVerificationRequired: boolean) {
	const turnstileContainer = (id: string) => turnstileSiteKey ? `<div class="turnstile-container"><div id="${id}"></div></div>` : "";
	const turnstileScript = turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad" defer></script>' : "";
	const regButtonText = emailVerificationRequired ? "发送验证码" : "注册";
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>登录 - 待办事项</title>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		.hidden-section { display: none; }
	</style>
	${turnstileScript}
</head>
<body class="has-background-light">
	<section class="section">
		<div class="container">
			<div class="columns is-centered">
				<div class="column is-4-desktop is-6-tablet">
					<div class="box">
						<h1 class="title is-4 has-text-centered">待办事项</h1>
						<p class="subtitle is-6 has-text-centered has-text-grey" id="authSubtitle">登录以开始使用</p>

						<!-- 登录表单 -->
						<form id="loginForm">
							<div class="field">
								<label class="label">用户名</label>
								<div class="control">
									<input type="text" id="loginUsername" class="input" required />
								</div>
							</div>
							<div class="field">
								<label class="label">密码</label>
								<div class="control">
									<input type="password" id="loginPassword" class="input" required />
								</div>
							</div>
							<div class="field is-flex is-justify-content-center">${turnstileContainer("ts-login")}</div>
							<div class="field">
								<button type="submit" class="button is-primary is-fullwidth">登录</button>
							</div>
							<div class="has-text-centered mt-4">
								${registrationEnabled ? `<a href="#" onclick="showRegisterForm(); return false;" class="mr-3">注册账号</a>` : ""}
								<a href="#" onclick="showForgotForm(); return false;">忘记密码</a>
							</div>
						</form>

						${registrationEnabled ? `
						<!-- 注册表单 -->
						<form id="registerForm" style="display: none;">
							<div class="field">
								<label class="label">用户名</label>
								<div class="control">
									<input type="text" id="regUsername" class="input" required />
								</div>
							</div>
							<div class="field">
								<label class="label">邮箱</label>
								<div class="control">
									<input type="email" id="regEmail" class="input" required />
								</div>
							</div>
							<div class="field">
								<label class="label">密码</label>
								<div class="control">
									<input type="password" id="regPassword" class="input" required minlength="6" />
								</div>
							</div>
							<div class="field">
								<label class="label">确认密码</label>
								<div class="control">
									<input type="password" id="regConfirmPassword" class="input" required />
								</div>
							</div>
							<div class="field is-flex is-justify-content-center">${turnstileContainer("ts-register")}</div>
							<div class="field">
								<button type="submit" class="button is-primary is-fullwidth">${regButtonText}</button>
							</div>
							<div class="has-text-centered mt-4">
								<a href="#" onclick="showLoginForm(); return false;">已有账号？返回登录</a>
							</div>
						</form>

						${emailVerificationRequired ? `
						<!-- 注册验证码表单 -->
						<div id="regVerifySection" class="hidden-section">
							<p class="has-text-centered has-text-grey is-size-7 mb-4">验证码已发送至您的邮箱，请输入验证码完成注册</p>
							<div class="field">
								<label class="label">验证码</label>
								<div class="control">
									<input type="text" id="regCode" class="input" placeholder="6位验证码" maxlength="6" />
								</div>
							</div>
							<div class="field">
								<button class="button is-primary is-fullwidth" onclick="submitRegisterVerify()">完成注册</button>
							</div>
							<div class="has-text-centered mt-4">
								<a href="#" onclick="showRegisterForm(); return false;">返回上一步</a>
							</div>
						</div>
						` : ""}` : ""}

						<!-- 忘记密码表单 -->
						<div id="forgotSection" class="hidden-section">
							<p class="has-text-centered has-text-grey is-size-7 mb-4">输入用户名，我们将发送验证码到您绑定的邮箱</p>
							<div class="field">
								<label class="label">用户名</label>
								<div class="control">
									<input type="text" id="forgotUsername" class="input" placeholder="输入你的用户名" />
								</div>
							</div>
							<div class="field is-flex is-justify-content-center">${turnstileContainer("ts-forgot")}</div>
							<div class="field">
								<button class="button is-primary is-fullwidth" onclick="sendForgotCode()">发送验证码</button>
							</div>
							<div class="has-text-centered mt-4">
								<a href="#" onclick="showLoginForm(); return false;">返回登录</a>
							</div>
						</div>

						<!-- 重置密码表单 -->
						<div id="resetCodeSection" class="hidden-section">
							<p class="has-text-centered has-text-grey is-size-7 mb-4">输入验证码和新密码</p>
							<div class="field">
								<label class="label">验证码</label>
								<div class="control">
									<input type="text" id="resetCode" class="input" placeholder="6位验证码" maxlength="6" />
								</div>
							</div>
							<div class="field">
								<label class="label">新密码</label>
								<div class="control">
									<input type="password" id="resetNewPassword" class="input" placeholder="至少6位字符" minlength="6" />
								</div>
							</div>
							<div class="field">
								<label class="label">确认新密码</label>
								<div class="control">
									<input type="password" id="resetConfirmPassword" class="input" placeholder="再次输入新密码" />
								</div>
							</div>
							<div class="field is-flex is-justify-content-center">${turnstileContainer("ts-reset-code")}</div>
							<div class="field">
								<button class="button is-primary is-fullwidth" onclick="submitResetPassword()">重置密码</button>
							</div>
							<div class="has-text-centered mt-4">
								<a href="#" onclick="showForgotForm(); return false;">返回上一步</a>
							</div>
						</div>

						${oauthProviders.length > 0 ? `<hr><p class="has-text-centered has-text-grey is-size-7 mb-3">或使用以下方式登录</p><div class="buttons is-centered">${oauthProviders.map(p => `<button class="button is-outlined" onclick="oauthLogin('${p.key}')"><span class="icon mr-2">${p.icon}</span>${p.name}</button>`).join("")}</div>` : ""}
						<p id="errorMsg" class="has-text-danger has-text-centered mt-4 is-hidden"></p>
						<p id="successMsg" class="has-text-success has-text-centered mt-4 is-hidden"></p>
					</div>
				</div>
			</div>
		</div>
	</section>
	<script>
		const turnstileSiteKey = ${turnstileSiteKey ? `"${turnstileSiteKey}"` : "null"};
		const registrationEnabled = ${registrationEnabled};
		const emailVerificationRequired = ${emailVerificationRequired};
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
			errorMsg.classList.remove("is-hidden");
			successMsg.classList.add("is-hidden");
		}

		function showSuccess(msg) {
			successMsg.textContent = msg;
			successMsg.classList.remove("is-hidden");
			errorMsg.classList.add("is-hidden");
		}

		function hideMessages() {
			errorMsg.classList.add("is-hidden");
			successMsg.classList.add("is-hidden");
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
			if (data.skipVerification) {
				setTimeout(showLoginForm, 1500);
			} else {
				setTimeout(showRegVerifyForm, 1500);
			}
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
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		.provider-item.open .provider-fields { display: block; }
		.provider-fields { display: none; }
	</style>
</head>
<body class="has-background-light">
	<section class="section">
		<div class="container">
			<div class="columns is-centered">
				<div class="column is-5-desktop is-8-tablet">
					<div class="box">
						<h1 class="title is-4 has-text-centered">初始设置</h1>
						<p class="subtitle is-6 has-text-centered has-text-grey">创建管理员账号或配置 OAuth 登录方式</p>
						<form id="setupForm">
							<div class="box">
								<h2 class="subtitle is-6">创建管理员账号</h2>
								<div class="field">
									<label class="label is-small">用户名</label>
									<div class="control">
										<input type="text" name="admin_username" class="input" placeholder="输入管理员用户名" />
									</div>
								</div>
								<div class="field">
									<label class="label is-small">密码</label>
									<div class="control">
										<input type="password" name="admin_password" class="input" placeholder="至少6位字符" />
									</div>
								</div>
							</div>
							<hr>
							<p class="has-text-centered has-text-grey is-size-7 mb-4">或配置 OAuth 登录（可选）</p>
											<div class="provider-list">
								<div class="provider-item box mb-3" data-provider="github">
									<div class="is-flex is-align-items-center is-clickable" onclick="toggleProvider(this)">
										<span class="icon is-medium mr-3">🐙</span>
										<span class="is-flex-grow-1 has-text-weight-medium">GitHub</span>
										<span class="icon">▼</span>
									</div>
									<div class="provider-fields mt-3">
										<div class="field">
											<label class="label is-small">Client ID</label>
											<div class="control">
												<input type="text" name="oauth_github_client_id" class="input is-small" placeholder="GitHub OAuth App Client ID" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Client Secret</label>
											<div class="control">
												<input type="password" name="oauth_github_client_secret" class="input is-small" placeholder="GitHub OAuth App Client Secret" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Redirect URI</label>
											<div class="control">
												<input type="text" name="oauth_github_redirect_uri" class="input is-small" placeholder="留空自动生成" />
											</div>
											<p class="help">在 GitHub OAuth App 设置中填入此地址</p>
										</div>
									</div>
								</div>
								<div class="provider-item box mb-3" data-provider="google">
									<div class="is-flex is-align-items-center is-clickable" onclick="toggleProvider(this)">
										<span class="icon is-medium mr-3">🔵</span>
										<span class="is-flex-grow-1 has-text-weight-medium">Google</span>
										<span class="icon">▼</span>
									</div>
									<div class="provider-fields mt-3">
										<div class="field">
											<label class="label is-small">Client ID</label>
											<div class="control">
												<input type="text" name="oauth_google_client_id" class="input is-small" placeholder="Google OAuth Client ID" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Client Secret</label>
											<div class="control">
												<input type="password" name="oauth_google_client_secret" class="input is-small" placeholder="Google OAuth Client Secret" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Redirect URI</label>
											<div class="control">
												<input type="text" name="oauth_google_redirect_uri" class="input is-small" placeholder="留空自动生成" />
											</div>
											<p class="help">在 Google Cloud Console 中填入此地址</p>
										</div>
									</div>
								</div>
								<div class="provider-item box mb-3" data-provider="microsoft">
									<div class="is-flex is-align-items-center is-clickable" onclick="toggleProvider(this)">
										<span class="icon is-medium mr-3">🪟</span>
										<span class="is-flex-grow-1 has-text-weight-medium">Microsoft</span>
										<span class="icon">▼</span>
									</div>
									<div class="provider-fields mt-3">
										<div class="field">
											<label class="label is-small">Client ID</label>
											<div class="control">
												<input type="text" name="oauth_microsoft_client_id" class="input is-small" placeholder="Azure AD App Client ID" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Client Secret</label>
											<div class="control">
												<input type="password" name="oauth_microsoft_client_secret" class="input is-small" placeholder="Azure AD App Client Secret" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Tenant</label>
											<div class="control">
												<input type="text" name="oauth_microsoft_tenant" class="input is-small" placeholder="common / organizations / consumers" />
											</div>
											<p class="help">留空使用 common</p>
										</div>
										<div class="field">
											<label class="label is-small">Redirect URI</label>
											<div class="control">
												<input type="text" name="oauth_microsoft_redirect_uri" class="input is-small" placeholder="留空自动生成" />
											</div>
										</div>
									</div>
								</div>
								<div class="provider-item box mb-3" data-provider="gitee">
									<div class="is-flex is-align-items-center is-clickable" onclick="toggleProvider(this)">
										<span class="icon is-medium mr-3">🔷</span>
										<span class="is-flex-grow-1 has-text-weight-medium">Gitee</span>
										<span class="icon">▼</span>
									</div>
									<div class="provider-fields mt-3">
										<div class="field">
											<label class="label is-small">Client ID</label>
											<div class="control">
												<input type="text" name="oauth_gitee_client_id" class="input is-small" placeholder="Gitee OAuth App Client ID" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Client Secret</label>
											<div class="control">
												<input type="password" name="oauth_gitee_client_secret" class="input is-small" placeholder="Gitee OAuth App Client Secret" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Redirect URI</label>
											<div class="control">
												<input type="text" name="oauth_gitee_redirect_uri" class="input is-small" placeholder="留空自动生成" />
											</div>
										</div>
									</div>
								</div>
								<div class="provider-item box mb-3" data-provider="cloudflare">
									<div class="is-flex is-align-items-center is-clickable" onclick="toggleProvider(this)">
										<span class="icon is-medium mr-3">☁️</span>
										<span class="is-flex-grow-1 has-text-weight-medium">Cloudflare SSO</span>
										<span class="icon">▼</span>
									</div>
									<div class="provider-fields mt-3">
										<div class="field">
											<label class="label is-small">Client ID</label>
											<div class="control">
												<input type="text" name="oauth_cloudflare_client_id" class="input is-small" placeholder="Cloudflare OAuth Client ID" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Client Secret</label>
											<div class="control">
												<input type="password" name="oauth_cloudflare_client_secret" class="input is-small" placeholder="Cloudflare OAuth Client Secret" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Redirect URI</label>
											<div class="control">
												<input type="text" name="oauth_cloudflare_redirect_uri" class="input is-small" placeholder="留空自动生成" />
											</div>
										</div>
									</div>
								</div>
								<div class="provider-item box mb-3" data-provider="casdoor">
									<div class="is-flex is-align-items-center is-clickable" onclick="toggleProvider(this)">
										<span class="icon is-medium mr-3">🔐</span>
										<span class="is-flex-grow-1 has-text-weight-medium">Casdoor</span>
										<span class="icon">▼</span>
									</div>
									<div class="provider-fields mt-3">
										<div class="field">
											<label class="label is-small">Server URL</label>
											<div class="control">
												<input type="text" name="oauth_casdoor_server_url" class="input is-small" placeholder="https://your-casdoor.example.com" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Client ID</label>
											<div class="control">
												<input type="text" name="oauth_casdoor_client_id" class="input is-small" placeholder="Casdoor Client ID" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Client Secret</label>
											<div class="control">
												<input type="password" name="oauth_casdoor_client_secret" class="input is-small" placeholder="Casdoor Client Secret" />
											</div>
										</div>
										<div class="field">
											<label class="label is-small">Redirect URI</label>
											<div class="control">
												<input type="text" name="oauth_casdoor_redirect_uri" class="input is-small" placeholder="留空自动生成" />
											</div>
										</div>
									</div>
								</div>
							</div>
							<button type="submit" class="button is-primary is-fullwidth" id="submitBtn">保存并前往登录</button>
						</form>
						<div id="msgBox" class="notification mt-4 is-hidden"></div>
					</div>
				</div>
			</div>
		</div>
	</section>
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
			msgBox.className = "notification mt-4 is-" + type;
			msgBox.classList.remove("is-hidden");
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
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		.tag-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; color: white; }
		.todo-item.completed .todo-title { text-decoration: line-through; color: #999; }
		.step-item.completed .step-title { text-decoration: line-through; color: #999; }
	</style>
</head>
<body class="has-background-light">
	<section class="section">
		<div class="container">
			<div class="columns is-centered">
				<div class="column is-6-desktop is-8-tablet">
					<h1 class="title is-4 has-text-centered">${escapeHtml(username)} 的待办</h1>
					<p class="subtitle is-6 has-text-centered has-text-grey">公开分享的待办列表</p>
					<ul id="todoList"></ul>
				</div>
			</div>
		</div>
	</section>
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
				todoList.innerHTML = '<li class="has-text-centered has-text-grey py-6">暂无公开的待办事项</li>';
				return;
			}
			todoList.innerHTML = todos.map(todo => {
				const tagsHtml = (todo.tags || []).map(tag => \`
					<span class="tag-badge" style="background: \${tag.color}" title="\${escapeHtml(tag.name)}">\${escapeHtml(tag.name)}</span>
				\`).join("");
				const stepsHtml = todo.steps && todo.steps.length > 0 ? \`
					<div class="mt-3">
						<div class="notification is-light" style="border-left: 3px solid #9c27b0;">
							<p class="has-text-weight-semibold has-text-link">步骤</p>
							<ul class="mt-2">
								\${todo.steps.map(step => \`
									<li class="step-item \${step.completed ? 'completed' : ''} is-flex is-align-items-center mb-2">
										<input type="checkbox" \${step.completed ? 'checked' : ''} disabled class="mr-2" />
										<span class="step-title is-size-7">\${escapeHtml(step.title)}</span>
									</li>
								\`).join("")}
							</ul>
						</div>
					</div>
				\` : '';
				const notesHtml = todo.notes_html ? \`
					<div class="mt-3">
						<div class="notification is-warning is-light" style="border-left: 3px solid #ff9800;">
							<p class="has-text-weight-semibold">备注</p>
							<div class="content box is-small mt-2">\${todo.notes_html}</div>
						</div>
					</div>
				\` : '';
				return \`
					<li class="todo-item \${todo.completed ? 'completed' : ''} box mb-3">
						<div class="is-flex is-align-items-center">
							<input type="checkbox" \${todo.completed ? 'checked' : ''} disabled class="mr-3" />
							<span class="todo-title is-flex-grow-1">\${escapeHtml(todo.title)}</span>
						</div>
						<div class="mt-2">\${tagsHtml}</div>
						\${notesHtml}
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
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		.password-strength { height: 4px; border-radius: 2px; margin-top: 0.5rem; background: #eee; }
		.password-strength .bar { height: 100%; border-radius: 2px; transition: all 0.3s; }
		.password-strength .weak { width: 33%; background: #ff4d4f; }
		.password-strength .medium { width: 66%; background: #faad14; }
		.password-strength .strong { width: 100%; background: #52c41a; }
	</style>
	${turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad" defer></script>' : ""}
</head>
<body class="has-background-light">
	<section class="section">
		<div class="container">
			<div class="columns is-centered">
				<div class="column is-4-desktop is-6-tablet">
					<div class="box">
						<h1 class="title is-4 has-text-centered">重置密码</h1>
						<p class="subtitle is-6 has-text-centered has-text-grey">通过 OAuth 验证身份后设置新密码</p>
						<form id="resetForm">
							<div class="field">
								<label class="label">新密码</label>
								<div class="control">
									<input type="password" id="newPassword" class="input" required minlength="6" />
								</div>
								<div class="password-strength"><div class="bar" id="strengthBar"></div></div>
							</div>
							<div class="field">
								<label class="label">确认密码</label>
								<div class="control">
									<input type="password" id="confirmPassword" class="input" required />
								</div>
							</div>
							${turnstileSiteKey ? `<div class="field is-flex is-justify-content-center"><div id="ts-reset"></div></div>` : ""}
							<div class="field">
								<button type="submit" class="button is-primary is-fullwidth">设置新密码</button>
							</div>
						</form>
						<p id="errorMsg" class="has-text-danger has-text-centered mt-4 is-hidden"></p>
						<p id="successMsg" class="has-text-success has-text-centered mt-4 is-hidden"></p>
					</div>
				</div>
			</div>
		</div>
	</section>
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
			errorMsg.classList.remove("is-hidden");
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
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		@media (max-width: 768px) {
			.admin-header { flex-direction: column; align-items: flex-start !important; gap: 0.75rem; }
			.admin-header .level-right { width: 100%; }
			.admin-header .buttons { flex-wrap: wrap; gap: 0.25rem; }
			.table-container { overflow-x: auto; }
		}
	</style>
</head>
<body class="has-background-light">
	<section class="section">
		<div class="container">
			<div class="level mb-5 admin-header">
				<div class="level-left">
					<h1 class="title is-3">用户管理</h1>
				</div>
				<div class="level-right">
					<div class="buttons">
						<a class="button is-warning" href="/admin/settings">系统设置</a>
						<a class="button is-primary" href="/">返回待办</a>
					</div>
				</div>
			</div>
			<div class="table-container">
			<table class="table is-fullwidth is-striped is-hoverable">
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
		</div>
	</section>
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
				userTableBody.innerHTML = '<tr><td colspan="4" class="has-text-centered has-text-grey py-6">暂无用户</td></tr>';
				return;
			}
			userTableBody.innerHTML = users.map(user => \`
				<tr>
					<td>\${escapeHtml(user.username)}</td>
					<td><span class="tag \${user.is_admin ? 'is-warning' : 'is-light'}">\${user.is_admin ? '管理员' : '用户'}</span></td>
					<td>\${user.created_at}</td>
					<td>
						<button class="button is-small is-info" onclick="toggleAdmin(\${user.id})">\${user.is_admin ? '取消管理员' : '设为管理员'}</button>
						<button class="button is-small is-danger" onclick="deleteUser(\${user.id})" \${user.username === adminUsername ? 'disabled' : ''}>删除</button>
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
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		@media (max-width: 768px) {
			.settings-header { flex-direction: column; align-items: flex-start !important; gap: 0.75rem; }
			.settings-header .level-right { width: 100%; }
			.settings-header .buttons { flex-wrap: wrap; gap: 0.25rem; }
		}
	</style>
</head>
<body class="has-background-light">
	<div class="notification-container" style="position: fixed; top: 1rem; right: 1rem; z-index: 2000;"></div>
	<section class="section">
		<div class="container">
			<div class="level mb-5 settings-header">
				<div class="level-left">
					<h1 class="title is-3">系统设置</h1>
				</div>
				<div class="level-right">
					<div class="buttons">
						<a class="button is-dark" href="/admin">用户管理</a>
						<a class="button is-primary" href="/">返回待办</a>
					</div>
				</div>
			</div>
			<div id="msgBox" class="notification is-hidden"></div>
			<div class="box">
				<h2 class="subtitle is-5">注册设置</h2>
				<div class="field is-flex is-align-items-center is-justify-content-space-between">
					<label>允许新用户注册</label>
					<input type="checkbox" id="regToggle" class="switch" />
				</div>
				<div class="field is-flex is-align-items-center is-justify-content-space-between">
					<label>强制验证邮箱（登录前必须绑定并验证邮箱）</label>
					<input type="checkbox" id="emailVerifyToggle" class="switch" />
				</div>
			</div>
			<div class="box">
				<h2 class="subtitle is-5">邮件服务配置（SMTP）</h2>
				<form id="smtpForm">
					<div class="field">
						<label class="label">SMTP 服务器地址</label>
						<div class="control">
							<input type="text" id="smtpHost" class="input" placeholder="smtp.example.com" />
						</div>
					</div>
					<div class="field">
						<label class="label">SMTP 端口</label>
						<div class="control">
							<input type="number" id="smtpPort" class="input" placeholder="587" />
						</div>
					</div>
					<div class="field">
						<label class="label">SMTP 用户名</label>
						<div class="control">
							<input type="text" id="smtpUser" class="input" placeholder="user@example.com" />
						</div>
					</div>
					<div class="field">
						<label class="label">SMTP 密码</label>
						<div class="control">
							<input type="password" id="smtpPass" class="input" placeholder="SMTP 密码或授权码" />
						</div>
					</div>
					<div class="field">
						<label class="label">发件人地址</label>
						<div class="control">
							<input type="email" id="smtpFrom" class="input" placeholder="noreply@example.com" />
						</div>
					</div>
					<div class="field">
						<label class="label">测试邮件收件人</label>
						<div class="control">
							<input type="email" id="testRecipient" class="input" placeholder="test@example.com" />
						</div>
					</div>
					<div class="buttons">
						<button type="submit" class="button is-primary">保存配置</button>
						<button type="button" class="button is-dark" onclick="testSmtp()">发送测试邮件</button>
					</div>
				</form>
			</div>
			<div class="box">
				<h2 class="subtitle is-5">邮件限流设置</h2>
				<p class="is-size-7 has-text-grey mb-4">限制单个 IP 地址在指定时间窗口内的邮件发送次数，超过限制后将进入冷却期。</p>
				<form id="rateLimitForm">
					<div class="field">
						<label class="label">时间窗口内最大发送次数</label>
						<div class="control">
							<input type="number" id="rateLimitMax" class="input" min="1" max="100" placeholder="3" />
						</div>
					</div>
					<div class="field">
						<label class="label">时间窗口（分钟）</label>
						<div class="control">
							<input type="number" id="rateLimitWindow" class="input" min="1" max="1440" placeholder="10" />
						</div>
					</div>
					<div class="field">
						<label class="label">冷却时间（小时）</label>
						<div class="control">
							<input type="number" id="rateLimitCooldown" class="input" min="1" max="720" placeholder="24" />
						</div>
					</div>
					<div class="buttons">
						<button type="submit" class="button is-primary">保存限流设置</button>
					</div>
				</form>
			</div>
			<div class="box">
				<h2 class="subtitle is-5">OAuth 登录配置</h2>
				<p class="is-size-7 has-text-grey mb-4">配置 OAuth 后，用户可通过第三方账号登录。首次使用时请先配置至少一个 OAuth 提供商。</p>
				<div id="oauthConfigs"></div>
				<div class="buttons">
					<button type="button" class="button is-primary" onclick="saveOAuthSettings()">保存 OAuth 配置</button>
				</div>
			</div>
			<div class="box">
				<h2 class="subtitle is-5">Cloudflare Turnstile 验证码</h2>
				<p class="is-size-7 has-text-grey mb-4">配置 Turnstile 后，登录、注册、重置密码等敏感操作将需要人机验证。<a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank">前往 Cloudflare 控制台创建站点密钥</a></p>
				<form id="turnstileForm">
					<div class="field">
						<label class="label">站点密钥 (Site Key)</label>
						<div class="control">
							<input type="text" id="turnstileSiteKey" class="input" placeholder="0x4AAAAAA..." />
						</div>
					</div>
					<div class="field">
						<label class="label">密钥 (Secret Key)</label>
						<div class="control">
							<input type="password" id="turnstileSecretKey" class="input" placeholder="0x4AAAAAA..." />
						</div>
					</div>
					<div class="buttons">
						<button type="submit" class="button is-primary">保存 Turnstile 配置</button>
						<button type="button" class="button is-dark" onclick="resetTurnstileSettings()">重置配置</button>
					</div>
				</form>
			</div>
		</div>
	</section>
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
				<details class="mb-4 box">
					<summary class="has-text-weight-medium">\${p.name}</summary>
					<div class="mt-4">
						\${p.fields.map(f => {
							const settingKey = \`oauth_\${p.key}_\${f}\`;
							const label = f === "client_id" ? "Client ID" : f === "client_secret" ? "Client Secret" : f === "server_url" ? "Server URL" : f === "tenant" ? "Tenant (留空使用 common)" : "Redirect URI";
							const placeholder = f === "client_id" ? "OAuth Client ID" : f === "client_secret" ? "OAuth Client Secret" : f === "server_url" ? "https://your-casdoor.example.com" : f === "tenant" ? "common / organizations / consumers" : "留空自动生成";
							const type = f === "client_secret" ? "password" : "text";
							return \`<div class="field"><label class="label">\${label}</label><div class="control"><input type="\${type}" id="\${settingKey}" class="input" placeholder="\${placeholder}" /></div></div>\`;
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
			document.getElementById("rateLimitMax").value = s.email_rate_limit_max || "";
			document.getElementById("rateLimitWindow").value = s.email_rate_limit_window || "";
			document.getElementById("rateLimitCooldown").value = s.email_rate_limit_cooldown || "";

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

			document.getElementById("turnstileSiteKey").value = s.turnstile_site_key || "";
			document.getElementById("turnstileSecretKey").value = "";
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

		const rateLimitForm = document.getElementById("rateLimitForm");
		rateLimitForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const maxVal = parseInt(document.getElementById("rateLimitMax").value, 10);
			const windowVal = parseInt(document.getElementById("rateLimitWindow").value, 10);
			const cooldownVal = parseInt(document.getElementById("rateLimitCooldown").value, 10);
			if (!maxVal || maxVal < 1) { showMsg("最大发送次数必须为正整数", "error"); return; }
			if (!windowVal || windowVal < 1) { showMsg("时间窗口必须为正整数", "error"); return; }
			if (!cooldownVal || cooldownVal < 1) { showMsg("冷却时间必须为正整数", "error"); return; }
			const data = {
				email_rate_limit_max: String(maxVal),
				email_rate_limit_window: String(windowVal),
				email_rate_limit_cooldown: String(cooldownVal),
			};
			const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
			const result = await res.json();
			if (!res.ok) { showMsg(result.error, "error"); return; }
			showMsg("限流设置已保存", "success");
		});

		const turnstileForm = document.getElementById("turnstileForm");
		turnstileForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const data = {
				turnstile_site_key: document.getElementById("turnstileSiteKey").value.trim(),
				turnstile_secret_key: document.getElementById("turnstileSecretKey").value.trim(),
			};
			const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
			const result = await res.json();
			if (!res.ok) { showMsg(result.error, "error"); return; }
			showMsg("Turnstile 配置已保存", "success");
		});

		window.resetTurnstileSettings = async () => {
			if (!confirm("确定要重置 Turnstile 配置吗？这将禁用所有的人机验证功能。")) return;
			const data = {
				turnstile_site_key: "",
				turnstile_secret_key: "",
			};
			const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
			const result = await res.json();
			if (!res.ok) { showMsg(result.error, "error"); return; }
			document.getElementById("turnstileSiteKey").value = "";
			document.getElementById("turnstileSecretKey").value = "";
			showMsg("Turnstile 配置已重置", "success");
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
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css">
	<style>
		.verify-section { display: none; }
		.verify-section.active { display: block; }
		.code-input { width: 48px; height: 56px; text-align: center; font-size: 1.5rem; }
		@media (max-width: 768px) {
			.profile-header { flex-direction: column; align-items: flex-start !important; gap: 0.75rem; }
			.profile-header .level-right { width: 100%; }
			.code-input { width: 40px; height: 48px; font-size: 1.25rem; }
		}
	</style>
	${turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad" defer></script>' : ""}
</head>
<body class="has-background-light">
	<section class="section">
		<div class="container">
			<div class="columns is-centered">
				<div class="column is-5-desktop is-8-tablet">
					<div class="level mb-5 profile-header">
						<div class="level-left">
							<h1 class="title is-3">个人资料</h1>
						</div>
						<div class="level-right">
							<a class="button is-primary" href="/">返回待办</a>
						</div>
					</div>
					<div class="box">
						<div class="is-flex is-justify-content-space-between is-align-items-center py-3" style="border-bottom: 1px solid #eee;">
							<span class="has-text-grey">用户名</span>
							<span class="has-text-weight-medium">${escapeHtml(username)}</span>
						</div>
						<div class="is-flex is-justify-content-space-between is-align-items-center py-3" style="border-bottom: 1px solid #eee;">
							<span class="has-text-grey">邮箱</span>
							<span class="has-text-weight-medium">${emailDisplay} ${verifiedBadge}</span>
						</div>
						<div class="is-flex is-justify-content-space-between is-align-items-center py-3">
							<span class="has-text-grey">密码</span>
							<span class="has-text-weight-medium">${passwordStatus}</span>
						</div>
					</div>
					<div class="box">
						<h2 class="subtitle is-6 mb-4">修改密码</h2>
						<form id="passwordForm">
							<div class="field">
								<label class="label">当前密码</label>
								<div class="control">
									<input type="password" id="currentPassword" class="input" placeholder="输入当前密码" />
								</div>
							</div>
							<div class="field">
								<label class="label">新密码</label>
								<div class="control">
									<input type="password" id="newPassword" class="input" placeholder="输入新密码（至少6位）" />
								</div>
							</div>
							<div class="field">
								<label class="label">确认新密码</label>
								<div class="control">
									<input type="password" id="confirmNewPassword" class="input" placeholder="再次输入新密码" />
								</div>
							</div>
							<button type="submit" class="button is-primary">修改密码</button>
						</form>
					</div>
					<div class="box">
						<h2 class="subtitle is-6 mb-4">绑定邮箱</h2>
						<form id="emailForm">
							<div class="field">
								<label class="label">邮箱地址</label>
								<div class="control">
									<input type="email" id="emailInput" class="input" placeholder="your@email.com" value="${email ? escapeHtml(email) : ""}" />
								</div>
							</div>
							${turnstileSiteKey ? `<div class="field is-flex is-justify-content-center"><div id="ts-email"></div></div>` : ""}
							<button type="submit" class="button is-primary" id="sendCodeBtn">发送验证码</button>
						</form>
						<div class="verify-section mt-4 pt-4" id="verifySection" style="border-top: 1px solid #eee;">
							<p class="has-text-centered has-text-grey mb-3">请输入收到的验证码</p>
							<div class="is-flex is-justify-content-center gap-2 mb-4">
								<input type="text" maxlength="1" class="input code-input" data-index="0" />
								<input type="text" maxlength="1" class="input code-input" data-index="1" />
								<input type="text" maxlength="1" class="input code-input" data-index="2" />
								<input type="text" maxlength="1" class="input code-input" data-index="3" />
								<input type="text" maxlength="1" class="input code-input" data-index="4" />
								<input type="text" maxlength="1" class="input code-input" data-index="5" />
							</div>
							<div class="buttons is-centered">
								<button type="button" class="button is-primary" onclick="verifyCode()">验证</button>
								<button type="button" class="button is-dark" onclick="cancelVerify()">取消</button>
							</div>
						</div>
					</div>
					<div id="msgBox" class="notification is-hidden"></div>
				</div>
			</div>
		</div>
	</section>
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
			msgBox.className = "notification is-" + type;
			setTimeout(() => { msgBox.classList.add("is-hidden"); }, 5000);
		}
	</script>
</body>
</html>`;
}
