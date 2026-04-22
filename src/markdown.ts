/**
 * Simple Markdown renderer
 * Supports: headers, bold, italic, links, lists, code blocks, inline code
 */

export function renderMarkdown(text: string): string {
	if (!text || text.trim() === "") {
		return ""
	}

	let html = text

	// Escape HTML special characters first
	html = html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")

	// Code blocks (```code```)
	html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
		const escapedCode = code.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
		return `<pre><code>${escapedCode}</code></pre>`
	})

	// Inline code (`code`)
	html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

	// Headers (# to ######)
	html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>")
	html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>")
	html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
	html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
	html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
	html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")

	// Bold (**text**)
	html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

	// Italic (*text* or _text_) - avoid matching within words
	html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")
	html = html.replace(/_([^_]+)_/g, "<em>$1</em>")

	// Links ([text](url))
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

	// Unordered lists (- item)
	html = html.replace(/^(\s*)- (.+)$/gm, "$1<li>$2</li>")

	// Ordered lists (1. item)
	html = html.replace(/^(\s*)\d+\. (.+)$/gm, "$1<li>$2</li>")

	// Wrap consecutive list items in <ul> or <ol>
	const lines = html.split("\n")
	const result: string[] = []
	let inUl = false
	let inOl = false

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const isLi = line.match(/^<li>/)
		const prevIsOl = i > 0 && lines[i - 1].match(/^\s*\d+\. /)

		if (isLi && prevIsOl && !inOl) {
			if (inUl) {
				result.push("</ul>")
				inUl = false
			}
			result.push("<ol>")
			inOl = true
		} else if (isLi && !prevIsOl && !inUl) {
			if (inOl) {
				result.push("</ol>")
				inOl = false
			}
			result.push("<ul>")
			inUl = true
		} else if (!isLi) {
			if (inUl) {
				result.push("</ul>")
				inUl = false
			}
			if (inOl) {
				result.push("</ol>")
				inOl = false
			}
		}

		result.push(line)
	}

	if (inUl) result.push("</ul>")
	if (inOl) result.push("</ol>")

	html = result.join("\n")

	// Paragraphs - wrap non-block elements
	const blocks = html.split("\n\n")
	html = blocks
		.map((block) => {
			const trimmed = block.trim()
			if (
				!trimmed ||
				trimmed.startsWith("<h") ||
				trimmed.startsWith("<ul") ||
				trimmed.startsWith("<ol") ||
				trimmed.startsWith("<li") ||
				trimmed.startsWith("<pre")
			) {
				return block
			}
			return `<p>${trimmed}</p>`
		})
		.join("\n")

	// Line breaks
	html = html.replace(/\n/g, "<br>")

	return html
}
