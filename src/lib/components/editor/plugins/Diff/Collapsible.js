import { CollapsibleNode } from '../Collapsible/Collapsible';
import { addInformationHover, applyCSSColorDiff } from './utils';

/**
 * @typedef {import('lexical').NodeKey} NodeKey
 *
 * @typedef {import('../Collapsible/Collapsible').SerializedCollapsibleNode} SerializedCollapsibleNode
 */

export class DiffCollapsibleNode extends CollapsibleNode {
	/** @type {import('./Types').___Change} */
	___change;

	/**
	 * @param {SerializedCollapsibleNode | DiffCollapsibleNode} node
	 * @param {NodeKey} [key]
	 */
	constructor(node, key) {
		super(
			// @ts-ignore
			node.title ?? node.__title,
			// @ts-ignore
			node.open ?? node.__open,
			key
		);

		// @ts-ignore
		this.___change = node.___change;
	}

	static getType() {
		return 'diff-collapsible';
	}

	/**
	 * @param {DiffCollapsibleNode} node
	 */
	static clone(node) {
		return new DiffCollapsibleNode(node, node.__key);
	}

	/**
	 * @param {SerializedCollapsibleNode} serializedNode
	 */
	static importJSON(serializedNode) {
		return $createDiffCollapsibleNode(serializedNode).updateFromJSON(serializedNode);
	}

	exportJSON() {
		return {
			...super.exportJSON(),
			___change: this.___change,
			type: DiffCollapsibleNode.getType(),
		};
	}

	/**
	 * @param {LexicalEditor} editor
	 */
	exportDOM(editor) {
		const dom = super.exportDOM(editor);

		if (
			dom.element instanceof HTMLElement &&
			Object.prototype.hasOwnProperty.call(this.___change, '___type')
		) {
			applyCSSColorDiff(dom.element, this.___change.___type);

			addInformationHover(dom.element, this.___change);
		}

		return dom;
	}

	static importDOM() {
		return CollapsibleNode.importDOM ? CollapsibleNode.importDOM() : null;
	}
}

/**
 * @param {SerializedCollapsibleNode} node
 */
export function $createDiffCollapsibleNode(node) {
	return new DiffCollapsibleNode(node);
}
