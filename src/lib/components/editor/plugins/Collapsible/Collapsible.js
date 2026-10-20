import { $applyNodeReplacement, ElementNode } from 'lexical';

export const COLLAPSIBLE_DEFAULT_TITLE = 'Title';
export const COLLAPSIBLE_MAX_TITLE_LENGTH = 200;

/**
 * @param {unknown} title
 */
const sanitizeTitle = (title) =>
	typeof title === 'string' ? title.slice(0, COLLAPSIBLE_MAX_TITLE_LENGTH) : '';

/**
 * @typedef {import('lexical').NodeKey} NodeKey
 * @typedef {import('lexical').SerializedElementNode} SerializedElementNode
 * @typedef {import('lexical').EditorConfig} EditorConfig
 * @typedef {import('lexical').DOMExportOutput} DOMExportOutput
 * @typedef {import('lexical').LexicalEditor} LexicalEditor
 *
 * @typedef {SerializedElementNode & { title: string, open?: boolean, type: string }} SerializedCollapsibleNode
 */

/**
 * @typedef {{ title?: string, open?: boolean }} CollapsibleNodePayload
 */

/**
 * Renders as `<details><summary>Title</summary>...children</details>`.
 * The "[show]" / "[hide]" label is drawn by CSS, so the article page needs no JavaScript.
 */
export class CollapsibleNode extends ElementNode {
	/** @type {string} */
	__title = COLLAPSIBLE_DEFAULT_TITLE;

	/** @type {boolean} */
	__open = false;

	/**
	 * @param {string} [title]
	 * @param {boolean} [open] Whether the article is rendered expanded by default.
	 * @param {NodeKey} [key]
	 */
	constructor(title = COLLAPSIBLE_DEFAULT_TITLE, open = false, key) {
		super(key);

		this.__title = title;
		this.__open = open;
	}

	static getType() {
		return 'collapsible';
	}

	$config() {
		return this.config('collapsible', { extends: ElementNode });
	}

	/**
	 * @returns {import('lexical').DOMConversionMap}
	 */
	static importDOM() {
		return {
			details: () => ({
				conversion: (domNode) => {
					const summary = domNode.querySelector(':scope > summary');
					const title = summary?.textContent?.trim() || undefined;
					const open = domNode.hasAttribute('open');

					return { node: $createCollapsibleNode({ title, open }) };
				},
				priority: 1,
			}),
			// The title is read from the summary above, so drop it (and its children) from the content.
			summary: () => ({
				conversion: () => ({ node: null, after: () => [] }),
				priority: 1,
			}),
		};
	}

	/**
	 * @param {CollapsibleNode} node
	 */
	static clone(node) {
		return new CollapsibleNode(node.__title, node.__open, node.__key);
	}

	/** @param {SerializedCollapsibleNode} serializedNode */
	static importJSON(serializedNode) {
		return $createCollapsibleNode(serializedNode).updateFromJSON(serializedNode);
	}

	/**
	 * @returns {SerializedCollapsibleNode}
	 */
	exportJSON() {
		return {
			...super.exportJSON(),
			type: CollapsibleNode.getType(),
			title: this.getTitle(),
			open: this.getOpen(),
		};
	}

	/**
	 * @param {string} title
	 */
	setTitle(title) {
		const self = this.getWritable();
		self.__title = sanitizeTitle(title);

		return this;
	}

	getTitle() {
		return this.getLatest().__title;
	}

	/**
	 * @param {boolean} [open]
	 */
	setOpen(open) {
		const self = this.getWritable();
		self.__open = Boolean(open);

		return this;
	}

	getOpen() {
		return Boolean(this.getLatest().__open);
	}

	/**
	 * @param {EditorConfig} config
	 */
	createDOM(config) {
		const details = document.createElement('details');
		details.classList.add('collapsible');

		const summary = document.createElement('summary');
		summary.classList.add('collapsible-summary');

		const title = document.createElement('span');
		title.classList.add('collapsible-title');
		summary.appendChild(title);

		details.appendChild(summary);

		if (config?.theme?.collapsibleEditable) {
			// The content has to stay reachable while editing, so the toggle is disabled in the editor.
			// `open` is set from the node's state in the article, see updateDOM.
			summary.contentEditable = 'false';
			summary.addEventListener('click', (e) => e.preventDefault());
		}

		this.updateDOM(null, details, config);

		return details;
	}

	/**
	 * @param {CollapsibleNode | null} _
	 * @param {HTMLDetailsElement} dom
	 * @param {EditorConfig?} config
	 */
	updateDOM(_, dom, config) {
		const title = dom.querySelector(':scope > summary > .collapsible-title');

		if (title && title.textContent !== this.getTitle()) {
			title.textContent = this.getTitle();
		}

		// An attribute rather than `dom.open`, so it also survives the server-side DOM used for the HTML export.
		const isOpen = config?.theme?.collapsibleEditable ? true : this.getOpen();

		if (isOpen) {
			dom.setAttribute('open', '');
		} else {
			dom.removeAttribute('open');
		}

		return false;
	}

	/**
	 * Keeps the summary as the first DOM child, Lexical manages everything after it.
	 *
	 * @param {HTMLElement} dom
	 */
	getDOMSlot(dom) {
		return super.getDOMSlot(dom).withAfter(dom.querySelector(':scope > summary'));
	}

	/**
	 * @param {LexicalEditor} editor
	 * @returns {DOMExportOutput}
	 */
	exportDOM(editor) {
		const output = super.exportDOM(editor);

		if (output.element instanceof HTMLElement) {
			const summary = output.element.querySelector(':scope > summary');
			summary?.removeAttribute('contenteditable');
		}

		return output;
	}

	canBeEmpty() {
		return false;
	}

	isShadowRoot() {
		return true;
	}
}

/** @param {CollapsibleNodePayload & { key?: NodeKey }} [payload] */
export function $createCollapsibleNode(payload) {
	const { title, open, key } = payload || {};
	return $applyNodeReplacement(
		new CollapsibleNode(title != null ? sanitizeTitle(title) : undefined, Boolean(open), key)
	);
}

/**
 * @param {any} node
 * @returns {node is CollapsibleNode}
 */
export function $isCollapsibleNode(node) {
	return node instanceof CollapsibleNode;
}
