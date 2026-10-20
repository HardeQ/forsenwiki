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
 * @typedef {SerializedElementNode & { title: string, type: string }} SerializedCollapsibleNode
 */

/**
 * @typedef {{ title?: string }} CollapsibleNodePayload
 */

export class CollapsibleNode extends ElementNode {
	/** @type {string} */
	__title = COLLAPSIBLE_DEFAULT_TITLE;

	/**
	 * @param {string} [title]
	 * @param {NodeKey} [key]
	 */
	constructor(title = COLLAPSIBLE_DEFAULT_TITLE, key) {
		super(key);

		this.__title = title;
	}

	static getType() {
		return 'collapsible';
	}

	$config() {
		return this.config('collapsible', { extends: ElementNode });
	}

	/**
	 * @returns {import('lexical').DOMConversionMap | null}
	 */
	static importDOM() {
		return {
			details: () => ({
				conversion: (domNode) => {
					const summary = domNode.querySelector(':scope > summary');
					const title = summary?.textContent?.trim() || undefined;

					return { node: $createCollapsibleNode({ title }) };
				},
				priority: 1,
			}),
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
		return new CollapsibleNode(node.__title, node.__key);
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
			summary.contentEditable = 'false';
		}

		this.updateDOM(null, details);

		return details;
	}

	/**
	 * @param {CollapsibleNode | null} _
	 * @param {HTMLDetailsElement} dom
	 */
	updateDOM(_, dom) {
		const title = dom.querySelector(':scope > summary > .collapsible-title');

		if (title && title.textContent !== this.getTitle()) {
			title.textContent = this.getTitle();
		}

		return false;
	}

	/**
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
	const { title, key } = payload || {};
	return $applyNodeReplacement(
		new CollapsibleNode(title != null ? sanitizeTitle(title) : undefined, key)
	);
}

/**
 * @param {any} node
 * @returns {node is CollapsibleNode}
 */
export function $isCollapsibleNode(node) {
	return node instanceof CollapsibleNode;
}
