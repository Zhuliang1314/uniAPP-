<template>
	<view class="px-3">
		<!-- 导航栏 -->
		<free-nav-bar showBack :showRight="true" bgColor="bg-white">
			<free-main-button name="发表" slot="right" @click="submit"></free-main-button>
		</free-nav-bar>
		<!-- 文字 -->
		<textarea placeholder="这一刻的想法" v-model="content" class="p-2 font-md mb-3"/>
		<!-- 图文 -->
		<free-upload-image :data="imageList" v-if="type === 'image'" @update="updateImage"></free-upload-image>
		<!-- 视频 -->
		<view v-if="type === 'video' && !video" class="flex align-center justify-center bg-light rounded" style="height: 350rpx;"
		hover-class="bg-hover-light" @click="uploadVideo">
			<text class="text-muted" style="font-size: 100rpx;">+</text>
		</view>
		<video v-if="type === 'video' && video" :src="video" controls></video>
		<view v-if="type === 'video' && video" class="my-3 flex align-center justify-center bg-light" hover-class="bg-hover-light" style="height: 100rpx;" @click="uploadVideo">
			<text class="font-md text-muted">点击切换视频</text>
		</view>
		
		
		<free-list-item title="所在位置" showRight :showLeftIcon="false">
			<text slot="right" class="font-md">位置</text>
		</free-list-item>
		<free-list-item title="提醒谁看" showRight :showLeftIcon="false">
			<text slot="right" class="font-md"></text>
		</free-list-item>
		<free-list-item title="谁可以看" showRight :showLeftIcon="false">
			<text slot="right" class="font-md">公开</text>
		</free-list-item>
		
	</view>
</template>

<script>
	import freeNavBar from '@/components/free-ui/free-nav-bar.vue';
	import freeMainButton from '@/components/free-ui/free-main-button.vue';
	import freeListItem from "@/components/free-ui/free-list-item.vue"
	import freeUploadImage from '@/components/free-ui/free-upload-image.vue';
	export default {
		components: {
			freeNavBar,
			freeMainButton,
			freeListItem,
			freeUploadImage
		},
		data() {
			return {
				content:"",
				imageList:[],
				type:"image",
				video:""
			}
		},
		onLoad(e) {
			this.type = e.type
		},
		methods: {
			submit(){
				console.log('发表');
			},
			// 上传图片
			updateImage(list){
				this.imageList = list
			},
			// 上传视频
			uploadVideo(){
				uni.chooseVideo({
					maxDuration:10,
					success: (e) => {
						this.video = e.tempFilePath
					}
				})
			}
		}
	}
</script>

<style>

</style>
