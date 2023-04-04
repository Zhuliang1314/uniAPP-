<template>
	<view>

		<!-- 导航栏 -->
		<free-nav-bar :title="detail.name" :noreadnum="totalNoreadnum" showBack>
			<free-icon-button slot="right" :icon="'\ue6fd'" @click="openChatSet"></free-icon-button>
		</free-nav-bar>

		<!-- 聊天内容区域 -->
		<scroll-view scroll-y class="bg-light position-fixed left-0 right-0 px-3"
			style="bottom: 105rpx;box-sizing: border-box;" :style="chatBodyBottom" :show-scrollbar="false"
			:scroll-into-view="scrollIntoView" :scroll-with-animation="true" @click="clickPage">

			<!-- 聊天信息列表组件 -->
			<view v-for="(item,index) in list" :key="index" :id="'chatItem_'+index">
				<free-chat-item :item="item" :index="index" ref="chatItem"
					:pretime=" index > 0 ? list[index-1].create_time : 0" @long="long" @preview="previewImage"
					:shownickname="currentChatItem.shownickname">
				</free-chat-item>
			</view>

		</scroll-view>

		<!-- #ifdef APP-PLUS-NVUE -->
		<div v-if="mode === 'action' || mode === 'emoticon'" class="position-fixed top-0 right-0 left-0"
			:style="'bottom:'+maskBottom+'px;'" @click="clickPage"></div>
		<!-- #endif -->

		<!-- 底部输入框 -->
		<view class="position-fixed left-0 right-0 border-top flex align-center"
			style="background-color: #F7F7F6;height: 105rpx;" :style="'bottom:'+KeyboardHeight+'px;'">
			<free-icon-button :icon="(mode === 'audio') ? '\ue607':'\ue606'" @click="changeVoiceOrText">
			</free-icon-button>
			<view class="flex-1">
				<view v-if="mode === 'audio'" class="rounded flex align-center justify-center" style="height: 80rpx;"
					:class="isRecording?'bg-hover-light':'bg-white'" @touchstart="voiceTouchStart"
					@touchend="voiceTouchEnd" @touchcancel="voiceTouchCancel" @touchmove="voiceTouchMove">
					<text class="font">{{isRecording ? '松开 结束':'按住 说话'}}</text>
				</view>

				<textarea v-else fixed class="bg-white rounded p-2 font-md" style="height: 50rpx;max-width: 450rpx;"
					:adjust-position="false" v-model="text" @focus="mode = 'text'" />
			</view>
			<!-- 表情 -->
			<free-icon-button :icon="'\ue605'" @click="openActionOrEmoticon('emoticon')"></free-icon-button>
			<template v-if="text.length === 0">
				<!-- 扩展菜单 -->
				<free-icon-button :icon="'\ue603'" @click="openActionOrEmoticon('action')"></free-icon-button>
			</template>
			<view v-else class="flex-shrink">
				<!-- 发送按钮 -->
				<free-main-button name="发送" @click="send('text')"></free-main-button>
			</view>

		</view>

		<!-- 扩展菜单 -->
		<free-popup ref="action" bottom transformOrigin="center bottom" @hide="KeyboardHeight = 0" :mask="false">
			<view style="height: 580rpx;" class="border-top border-light-secondary bg-light">
				<swiper :indicator-dots="emoticonOrActionList.length > 1" style="height: 510rpx;">
					<swiper-item class="row" v-for="(item,index) in emoticonOrActionList" :key="index">
						<view class="col-3 flex flex-column align-center justify-center" style="height: 255rpx;"
							v-for="(item2,index2) in item" :key="index2" @click="actionEvent(item2)">
							<image :src="item2.icon" mode="widthFix" style="width: 100rpx;height: 100rpx;"></image>
							<text class="font-sm text-muted mt-2">{{item2.name}}</text>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</free-popup>


		<!-- 弹出层 -->
		<free-popup ref="extend" :bodyWidth="240" :bodyHeight="getMenusHeight" :tabbarHeight="105">
			<view class="flex flex-column" style="width: 240rpx;" :style="getMenusStyle">
				<view class="flex-1 flex align-center" hover-class="bg-light" v-for="(item,index) in menusList"
					:key="index" @click="clickEvent(item.event)">
					<text class="font-md pl-3">{{item.name}}</text>
				</view>
			</view>
		</free-popup>


		<!-- 录音提示 -->
		<view v-if="isRecording" class="position-fixed top-0 left-0 right-0 flex align-center justify-center"
			style="bottom: 105rpx;">
			<view style="width: 360rpx;height: 360rpx;background-color: rgba(0,0,0,0.5);"
				class="rounded flex flex-column align-center justify-center">
				<image src="/static/audio/recording.gif" style="width: 150rpx;height: 150rpx;"></image>
				<text class="font text-white mt-3">{{unRecord ? '松开手指，取消发送':'手指上滑，取消发送'}}</text>
			</view>
		</view>

	</view>
</template>

<script>
	// #ifdef APP-PLUS-NVUE
	const dom = weex.requireModule('dom')
	// #endif

	import freeNavBar from "@/components/free-ui/free-nav-bar.vue"
	import freeIconButton from "@/components/free-ui/free-icon-button.vue"
	import freeChatItem from '@/components/free-ui/free-chat-item.vue';
	import freePopup from "@/components/free-ui/free-popup.vue"
	import freeMainButton from '@/components/free-ui/free-main-button.vue';


	import {
		mapState,
		mapMutations
	} from 'vuex'

	import auth from '@/common/mixin/auth.js';

	export default {
		mixins: [auth],
		components: {
			freeNavBar,
			freeIconButton,
			freeChatItem,
			freePopup,
			freeMainButton
		},
		data() {
			return {
				scrollIntoView: "",
				// 模式 text输入文字，emoticon表情，action操作，audio音频
				mode: "text",
				// 扩展菜单列表
				actionList: [
					[{
						name: "相册",
						icon: "/static/images/extends/pic.png",
						event: "uploadImage"
					}, {
						name: "拍摄",
						icon: "/static/images/extends/video.png",
						event: "uploadVideo"
					}, {
						name: "收藏",
						icon: "/static/images/extends/shoucan.png",
						event: ""
					}, {
						name: "名片",
						icon: "/static/images/extends/man.png",
						event: ""
					}, {
						name: "语音通话",
						icon: "/static/images/extends/phone.png",
						event: ""
					}, {
						name: "位置",
						icon: "/static/images/extends/path.png",
						event: ""
					}]
				],
				emoticonList: [],
				// 键盘高度
				KeyboardHeight: 0,
				menus: [{
					name: "复制",
					event: '',
				}, {
					name: "发送给朋友",
					event: ''
				}, {
					name: "收藏",
					event: ''
				}, {
					name: "删除",
					event: ''
				}, {
					name: "多选",
					event: ''
				}, {
					name: "撤回",
					event: 'removeChatItem'
				}],
				navBarHeight: 0,
				list: [],
				// list:[{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:1,
				// 	nickname:"昵称",
				// 	type:"text",// image,audio,video
				// 	data:"你好你好你好你好你好你好你好你好你好你好你好你好你好你好",
				// 	create_time:1569331227,
				// 	isremove:false
				// },{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:2,
				// 	nickname:"昵称",
				// 	type:"text",// image,audio,video
				// 	data:"123456你好你好你好你好",
				// 	create_time:1569331267,
				// 	isremove:false
				// },{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:1,
				// 	nickname:"昵称",
				// 	type:"text",// image,audio,video
				// 	data:"你好你好你好你好你好你好你好你好你好你好你好你好你好你好",
				// 	create_time:1569331287,
				// 	isremove:false
				// },{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:2,
				// 	nickname:"昵称",
				// 	type:"text",// image,audio,video
				// 	data:"123456你好你好你好你好",
				// 	create_time:1569331327,
				// 	isremove:false
				// },{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:1,
				// 	nickname:"昵称",
				// 	type:"audio",// image,audio,video
				// 	data:"/static/audio/1.mp3",
				// 	options:{
				// 		time:60
				// 	},
				// 	create_time:1569331327,
				// 	isremove:false
				// },{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:1,
				// 	nickname:"昵称",
				// 	type:"audio",// image,audio,video
				// 	data:"/static/audio/2.mp3",
				// 	options:{
				// 		time:20
				// 	},
				// 	create_time:1569331327,
				// 	isremove:false
				// },{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:2,
				// 	nickname:"昵称",
				// 	type:"audio",// image,audio,video
				// 	data:"/static/audio/3.mp3",
				// 	options:{
				// 		time:10
				// 	},
				// 	create_time:1569331327,
				// 	isremove:false
				// },{
				// 	avatar:"/static/images/demo/demo6.jpg",
				// 	user_id:1,
				// 	nickname:"昵称",
				// 	type:"video",// image,audio,video
				// 	data:"/static/video/demo.mp4",
				// 	options:{
				// 		poster:"/static/video/demo.jpg"
				// 	},
				// 	create_time:1569331327,
				// 	isremove:false
				// }],
				// 当前操作的气泡索引
				propIndex: -1,
				// 输入文字
				text: "",

				// 音频录制状态
				isRecording: false,
				RecordingStartY: 0,
				// 取消录音
				unRecord: false,

				detail: {
					id: 0,
					name: "",
					avatar: "",
					chat_type: "user"
				}
			}
		},
		mounted() {
			var statusBarHeight = 0
			// #ifdef APP-PLUS-NVUE
			statusBarHeight = plus.navigator.getStatusbarHeight()
			// #endif
			this.navBarHeight = statusBarHeight + uni.upx2px(90)

			// 监听键盘高度变化
			uni.onKeyboardHeightChange(res => {
				if (this.mode !== 'action' && this.mode !== 'emoticon') {
					this.KeyboardHeight = res.height
				}
				if (this.KeyboardHeight > 0) {
					this.pageToBottom()
				}
			})


			// 注册发送音频事件
			this.regSendVoiceEvent((url) => {
				if (!this.unRecord) {
					this.send('audio', url, {
						time: this.RecordTime
					})
				}
			})

			this.pageToBottom()
		},
		computed: {
			...mapState({
				chatList: state => state.user.chatList,
				RECORD: state => state.audio.RECORD,
				RecordTime: state => state.audio.RecordTime,
				chat: state => state.user.chat,
				totalNoreadnum: state => state.user.totalNoreadnum
			}),
			//当前会话配置信息
			currentChatItem() {
				let index = this.chatList.findIindex(item => item.id === this.detail.id && item.chat_type === this.detail
					.chat_type)
				if (index !== -1) {
					return this.chatList[index]
				}
				return {}
			},
			// 获取蒙版的位置
			maskBottom() {
				return this.KeyboardHeight + uni.upx2px(105)
			},
			// 动态获取菜单高度
			getMenusHeight() {
				let H = 100
				return this.menus.length * H
			},
			// 获取菜单的样式
			getMenusStyle() {
				return `height: ${this.getMenusHeight}rpx;`
			},
			// 判断是否操作本人信息
			isdoSelf() {
				// 获取本人id（假设拿到了）
				let id = 1
				let user_id = this.propIndex > -1 ? this.list[this.propIndex].user_id : 0
				return user_id === id
			},
			// 获取操作菜单
			menusList() {
				return this.menus.filter(v => {
					if (v.name === '撤回' && !this.isdoSelf) {
						return false
					} else {
						return true
					}
				})
			},
			// 聊天区域bottom
			chatBodyBottom() {
				return `bottom:${uni.upx2px(105) + this.KeyboardHeight}px;top:${this.navBarHeight}px;`
			},
			// 获取操作或者表情列表
			emoticonOrActionList() {
				return (this.mode === 'emoticon' || this.mode === 'action') ? this[this.mode + 'List'] : []
			},
			// 所有信息的图片地址
			imageList() {
				let arr = []
				this.list.forEach((item) => {
					if (item.type === 'emoticon' || item.type === 'image') {
						arr.push(item.data)
					}
				})
				return arr
			}
		},
		watch: {
			mode(newValue, oldValue) {
				if (newValue !== 'action' && newValue !== 'emoticon') {
					this.$refs.action.hide()
				}
				if (newValue !== 'text') {
					uni.hideKeyboard()
				}
			}
		},
		onLoad(e) {
			if (!e.params) {
				return this.backToast()
			}
			this.detail = JSON.parse(e.params)
			console.log(this.detail);
			// 初始化
			this.__init()
			// 创建聊天对象
			this.chat.createChatObject(this.detail)
			// 获取历史记录
			this.list = this.chat.getChatDetail()
			// 监听接收聊天信息
			uni.$on('onMessage', (message) => {
				console.log('[聊天页] 监听接收聊天信息', message);
				if ((message.from_id === this.detail.id && message.chat_type === 'user') || (message.chat_type ===
						'group' && message.to_id === this.detail.id)) {
					this.list.push(message)
					// 置于底部
					this.pageToBottom()
				}
			})
		},
		destroyed() {
			// 销毁聊天对象
			this.chat.destoryChatObject()
			// 销毁监听接收聊天消息
			uni.$off('onMessage', () => {})
		},
		methods: {
			...mapMutations(['regSendVoiceEvent']),
			__init() {
				var total = 20
				var page = Math.ceil(total / 8)
				var arr = []
				for (var i = 0; i < page; i++) {
					var start = i * 8
					arr[i] = []
					for (var j = 0; j < 8; j++) {
						var no = start + j
						if ((no + 1) > total) {
							continue;
						}
						arr[i].push({
							name: "表情" + no,
							icon: "/static/images/emoticon/5497/" + no + '.gif',
							event: "sendEmoticon"
						})
					}
				}
				this.emoticonList = arr
			},
			// 打开扩展菜单或者表情包
			openActionOrEmoticon(mode = 'action') {
				this.mode = mode
				this.$refs.action.show()

				uni.hideKeyboard()
				this.KeyboardHeight = uni.upx2px(580)
			},
			// 发送
			send(type, data = '', options = {}) {
				// 组织数据格式
				switch (type) {
					case 'text':
						data = this.text
						break;
				}
				let message = this.chat.formatSendData({
					type,
					data,
					options
				})
				// 渲染到页面
				let index = this.list.length
				this.list.push(message)
				// 发送到服务端
				this.chat.send(message).then(res => {
					console.log(res);
					// 发送成功
					this.list[index].id = res.id
					this.list[index].sendStatus = 'success'
				}).catch(err => {
					// 发送失败
					this.list[index].sendStatus = 'fail'
					console.log(err);
				})
				// 发送文字成功，清空输入框
				if (type === 'text') {
					this.text = ''
				}
				// 置于底部
				this.pageToBottom()
			},
			// 回到底部
			pageToBottom() {
				// #ifdef APP-PLUS-NVUE
				let chatItem = this.$refs.chatItem
				let lastIndex = chatItem.length > 0 ? chatItem.length - 1 : 0
				if (chatItem[lastIndex]) {
					dom.scrollToElement(chatItem[lastIndex], {})
				}
				// #endif
				// #ifndef APP-NVUE
				setTimeout(() => {
					let lastIndex = this.list.length - 1
					this.scrollIntoView = 'chatItem_' + lastIndex
				}, 300)
				// #endif
			},
			// 长按消息气泡
			long({
				x,
				y,
				index
			}) {
				// 初始化 索引
				this.propIndex = index
				// 显示扩展菜单
				this.$refs.extend.show(x, y)
			},
			// 操作菜单方法分发
			clickEvent(event) {
				switch (event) {
					case 'removeChatItem': // 撤回消息
						// 拿到当前被操作的信息
						if (this.propIndex > -1) {
							this.list[this.propIndex].isremove = true
						}
						break;
					default:
						break;
				}
				// 关闭菜单
				this.$refs.extend.hide()
			},
			// 扩展菜单
			actionEvent(e) {
				switch (e.event) {
					case 'uploadImage': // 选择相册
						uni.chooseImage({
							count: 9,
							success: (res) => {
								// 发送到服务器
								// 渲染到页面
								res.tempFilePaths.forEach((item) => {
									this.send('image', item)
								})
							}
						})
						break;
					case 'uploadVideo': // 发送短视频
						uni.chooseVideo({
							maxDuration: 10,
							success: (res) => {
								this.send('video', res.tempFilePath)
								// 渲染页面
								// 发送到服务端（获取视频封面，返回url）
								// 修改本地的发送状态
							}
						})
						break;
					case 'sendEmoticon': // 发送表情包
						this.send('emoticon', e.icon)
						break;
				}
			},
			// 点击页面
			clickPage() {
				this.mode = ''
			},
			// 预览图片
			previewImage(url) {
				uni.previewImage({
					current: url,
					urls: this.imageList,
					indicator: "default"
				})
			},
			// 切换音频录制和文本输入
			changeVoiceOrText() {
				this.mode = this.mode !== 'audio' ? 'audio' : 'text'
			},
			// 录音相关
			// 录音开始
			voiceTouchStart(e) {
				// 初始化
				this.isRecording = true
				this.RecordingStartY = e.changedTouches[0].screenY
				this.unRecord = false
				// 开始录音
				this.RECORD.start({
					format: "mp3"
				})
			},
			// 录音结束
			voiceTouchEnd() {
				this.isRecording = false
				// 停止录音
				this.RECORD.stop()
			},
			// 录音被打断
			voiceTouchCancel() {
				this.isRecording = false
				this.unRecord = true
				// 停止录音
				this.RECORD.stop()
			},
			voiceTouchMove(e) {
				let Y = Math.abs(e.changedTouches[0].screenY - this.RecordingStartY)
				this.unRecord = (Y >= 50)
			},
			// 打开聊天信息设置
			openChatSet() {
				uni.navigateTo({
					url: '../chat-set/chat-set?params=' + JSON.stringify({
						id: this.detail.id,
						chat_type: this.detail.chat_type
					}),
				});
			}
		}
	}
</script>

<style>

</style>
