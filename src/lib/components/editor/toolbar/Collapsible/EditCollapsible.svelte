<script>
	import { ChevronsDownUpIcon, TypeIcon } from '@lucide/svelte';
	import { getEditor } from 'svelte-lexical';
	import { COLLAPSIBLE_MAX_TITLE_LENGTH } from '../../plugins/Collapsible/Collapsible';
	import EditorButton from '../EditorButton.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {import('$lib/lexical/custom').CollapsibleNode} selectedCollapsibleNode
	 */

	/** @type {Props & { [key: string]: any }} */
	let { selectedCollapsibleNode } = $props();

	let currentTitle = $derived(selectedCollapsibleNode.__title);
	let currentOpen = $derived(selectedCollapsibleNode.__open);

	let title = $derived(currentTitle);

	const editor = getEditor();

	const onChangeTitle = () => {
		editor.update(() => {
			selectedCollapsibleNode.setTitle(title);
		});
	};

	const toggleOpen = () => {
		editor.update(() => {
			selectedCollapsibleNode.setOpen(!currentOpen);
		});
	};
</script>

<div class="flex flex-col gap-4">
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

	<div
		class="forsen-wiki-theme-border flex items-center rounded-sm border bg-violet-900/25 text-sm text-white"
	>
		<EditorButton on:click={toggleOpen} isActive={!!currentOpen} title="Toggle expanded by default">
			<ChevronsDownUpIcon />
		</EditorButton>

		<div class="flex grow items-center gap-2 p-2">
			<span>Expanded by default</span>
		</div>
	</div>
</div>
