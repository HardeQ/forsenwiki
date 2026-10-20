<script>
	import { TypeIcon } from '@lucide/svelte';
	import { getEditor } from 'svelte-lexical';
	import { COLLAPSIBLE_MAX_TITLE_LENGTH } from '../../plugins/Collapsible/Collapsible';

	/**
	 * @typedef {Object} Props
	 * @property {import('$lib/lexical/custom').CollapsibleNode} selectedCollapsibleNode
	 */

	/** @type {Props & { [key: string]: any }} */
	let { selectedCollapsibleNode } = $props();

	let currentTitle = $derived(selectedCollapsibleNode.__title);

	let title = $derived(currentTitle);

	const editor = getEditor();

	const onChangeTitle = () => {
		editor.update(() => {
			selectedCollapsibleNode.setTitle(title);
		});
	};
</script>

<label title="Title" class="relative flex min-h-10.5 items-center gap-2">
	<span class="hidden">Title</span>
	<TypeIcon class="absolute left-4" />

	<input
		class="input-color h-full w-full p-0 pl-12 text-sm"
		placeholder="Title"
		maxlength={COLLAPSIBLE_MAX_TITLE_LENGTH}
		bind:value={title}
		oninput={onChangeTitle}
	/>
</label>
