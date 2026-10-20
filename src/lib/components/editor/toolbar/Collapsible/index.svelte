<script>
	import { $isCollapsibleNode as isCollapsibleNode } from '$lib/lexical/custom';
	import Wrapper from '../components/Wrapper.svelte';
	import Title from '../components/Title.svelte';
	import EditCollapsible from './EditCollapsible.svelte';

	/**
	 * @type {{ selectedNode: LexicalNode | null }}
	 */
	let { selectedNode = null } = $props();
</script>

{#if isCollapsibleNode(selectedNode)}
	<Wrapper>
		{#snippet title()}
			<Title {selectedNode} text="Collapsible" />
		{/snippet}

		{#snippet content()}
			<div class="p-2">
				<EditCollapsible selectedCollapsibleNode={selectedNode} />
			</div>
		{/snippet}
	</Wrapper>
{/if}
