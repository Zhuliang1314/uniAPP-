<template>
	<view class="page">
		<!-- 导航栏 -->
		<free-nav-bar title="我的收藏" showBack :showRight="false"></free-nav-bar>
		<view class="pt-3 px-3">
			<view class="bg-white rounded p-3">
				<text>聊天记录</text>
			</view>
		</view>
		<view class="pt-3 px-3">
			<view class="bg-white rounded p-3">
				<free-image src="/static/images/demo/demo6.jpg"></free-image>
			</view>
		</view>
	</view>
</template>

<script>
	import freeNavBar from "@/components/free-ui/free-nav-bar.vue"
	import freeImage from '@/components/free-ui/free-image.vue';
	export default {
		components: {
			freeNavBar,
			freeImage
		},
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
