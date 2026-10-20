<script module>
	/**
	 * @typedef {Readonly<import('./Collapsible').CollapsibleNodePayload>} CollapsibleNodePayload
	 */

	/** @type {import('lexical').LexicalCommand<CollapsibleNodePayload>} */
	export const INSERT_COLLAPSIBLE_COMMAND = createCommand();
</script>

<script>
	import {
		createCommand,
		$createParagraphNode as createParagraphNode,
		$isTextNode as isTextNode,
		$createTextNode as createTextNode,
		$getSelection as getSelection,
		COMMAND_PRIORITY_EDITOR,
		COMMAND_PRIORITY_NORMAL,
		KEY_ARROW_LEFT_COMMAND,
		KEY_ARROW_RIGHT_COMMAND,
	} from 'lexical';
	import {
		$insertNodeToNearestRoot as insertNodeToNearestRoot,
		mergeRegister,
	} from '@lexical/utils';
	import { getEditor } from 'svelte-lexical';
	import { $isAtNodeEnd as isAtNodeEnd } from '@lexical/selection';

	import { hasAdjacentNode, insertFnc } from '../../utils/insertUtils';
	import {
		$isCollapsibleNode as isCollapsibleNode,
		$createCollapsibleNode as createCollapsibleNode,
		CollapsibleNode,
	} from './Collapsible';

	/**
	 * @typedef {import('lexical').PointType} PointType
	 */

	/** @type {import('lexical').LexicalEditor} */
	const editor = getEditor();

	/** @param {CollapsibleNodePayload} payload */
	const wrapperInsertCollapsible = ({ title, open }) => {
		editor.update(() => {
			const collapsibleNode = createCollapsibleNode({ title, open });

			insertNodeToNearestRoot(collapsibleNode);

			collapsibleNode.append(createParagraphNode().append(createTextNode()));

			const firstDescendant = collapsibleNode.getFirstDescendant();

			if (isTextNode(firstDescendant)) {
				firstDescendant.select();
			}
		});
	};

	const INSERT_BEFORE = true;
	const INSERT_AFTER = false;

	// Collapsibles are shadow roots, so without this the caret can't leave one that's at the edge of its parent.
	const insertParagraph = (atBefore = INSERT_BEFORE) => {
		return editor.read(() => {
			const selection = getSelection();
			if (!selection?.isCollapsed()) {
				return false;
			}

			const [anchor, focus] = /** @type {[PointType, PointType]} */ (selection.getStartEndPoints());
			const anchorNode = anchor.getNode();

			const collapsibleParent = anchorNode.getParents().find((n) => isCollapsibleNode(n));

			if (!collapsibleParent) {
				return false;
			}

			let isAtStart;
			let isAtEnd;
			if (isTextNode(anchorNode)) {
				const allTextNodes = collapsibleParent.getAllTextNodes();

				isAtStart = anchor.offset === 0 && allTextNodes[0] === anchorNode;
				isAtEnd = isAtNodeEnd(focus) && allTextNodes[allTextNodes.length - 1] === anchorNode;
			} else {
				isAtStart = anchor.offset === 0 && collapsibleParent.getFirstChild() === anchorNode;
				isAtEnd = isAtNodeEnd(focus) && collapsibleParent.getLastChild() === anchorNode;
			}

			const isAtEdge = atBefore ? isAtStart : isAtEnd;
			const adjacentNode = hasAdjacentNode(atBefore, collapsibleParent);

			if (!isAtEdge || adjacentNode) {
				return false;
			}

			editor.update(() => {
				const newNode = createParagraphNode().append(createTextNode());
				const n = insertFnc(atBefore, collapsibleParent, newNode);

				n.selectStart();
			});

			return true;
		});
	};

	$effect(() => {
		if (!editor.hasNodes([CollapsibleNode])) {
			throw new Error('CollapsiblePlugin: CollapsibleNode not registered on editor');
		}

		return mergeRegister(
			editor.registerCommand(
				INSERT_COLLAPSIBLE_COMMAND,
				(payload) => {
					wrapperInsertCollapsible(payload);
					return true;
				},
				COMMAND_PRIORITY_EDITOR
			),
			editor.registerCommand(
				KEY_ARROW_LEFT_COMMAND,
				(payload) => {
					if (payload.ctrlKey) {
						return false;
					}

					return insertParagraph(INSERT_BEFORE);
				},
				COMMAND_PRIORITY_NORMAL
			),
			editor.registerCommand(
				KEY_ARROW_RIGHT_COMMAND,
				(payload) => {
					if (payload.ctrlKey) {
						return false;
					}

					return insertParagraph(INSERT_AFTER);
				},
				COMMAND_PRIORITY_NORMAL
			)
		);
	});
</script>
