<template>
	<view>
		<free-transparent-bar :scrollTop="scrollTop"
		@clickRight="clickRight"></free-transparent-bar>
		<view class="position-relative" style="height: 620rpx;">
			<image src="https://douyinzcmcss.oss-cn-shenzhen.aliyuncs.com/shengchengqi/datapic/1.jpg" mode="aspectFill" style="height: 590rpx;" class="bg-secondary w-100"></image>
			<image src="/static/images/demo/demo6.jpg" style="width: 120rpx;height: 120rpx;right: 30rpx;" class="bg-secondary rounded position-absolute bottom-0"></image>
			<text class="text-white font-md position-absolute"
			style="bottom: 45rpx;right: 160rpx;">Summer</text>
		</view>
		
		<!-- 朋友圈列表 -->
		<free-moment-list v-for="(item,index) in list" :key="index"
		:item="item" :index="index" @action="doAction"></free-moment-list>
		
		<!-- 评论框 -->
		<free-popup ref="action" bottom transformOrigin="center bottom">
			<view style="height: 105rpx;" class="bg-light border-top flex align-center px-3">
				<textarea fixed class="bg-white rounded p-2 font-md" style="height: 75rpx;width: 520rpx;" :focus="true" v-model="content"/>
				<free-icon-button :icon="'\ue605'"
				@click="changeFaceModal"></free-icon-button>
				<free-main-button name="发送" :disabled="content.length === 0" @click="send"></free-main-button>
			</view>
			<scroll-view v-if="faceModal" scroll-y="true" 
			style="height: 350rpx;"
			class="bg-light flex flex-wrap">
				<view style="width: 107rpx;height: 107rpx;"
				class="flex align-center justify-center"
				hover-class="bg-white"
				v-for="(item,index) in faceList"
				:key="index"
				@click="addFace(item)">
					<text>{{item}}</text>
				</view>
			</scroll-view>
		</free-popup>
		
	</view>
</template>

<script>
	import freeTransparentBar from '@/components/free-ui/free-transparent-bar.vue';
	import freeMomentList from '@/components/free-ui/free-moment-list.vue';
	import freePopup from '@/components/free-ui/free-popup.vue';
	import freeIconButton from "@/components/free-ui/free-icon-button.vue"
	import freeMainButton from '@/components/free-ui/free-main-button.vue';
	export default {
		components: {
			freeTransparentBar,
			freeMomentList,
			freePopup,
			freeIconButton,
			freeMainButton
		},
		data() {
			return {
				content:"",
				scrollTop:0,
				list:[{
					id:2,
					avatar:'/static/images/demo/demo6.jpg',
					username:'昵称',
					context:'靓仔，听说这个月会上线：外卖配送系统全栈教程，在线点播全栈教程，多端客服系统，企业网盘系统',
					image:[],
					video:false,
					create_time:1567481668,
					supports:[{
						id:1,
						username:"昵称",
						avatar:'/static/images/demo/demo6.jpg',
					}],
					comments:[{
						id:1,
						username:"昵称",
						content:"评论内容"
					}]
				},{
					id:2,
					avatar:'/static/images/demo/demo6.jpg',
					username:'昵称',
					context:'靓仔，听说这个月会上线：外卖配送系统全栈教程，在线点播全栈教程，多端客服系统，企业网盘系统',
					image:[{
						src:"https://douyinzcmcss.oss-cn-shenzhen.aliyuncs.com/shengchengqi/datapic/1.jpg"
					}],
					video:false,
					create_time:1567481668,
					supports:[],
					comments:[]
				},{
					id:2,
					avatar:'/static/images/demo/demo6.jpg',
					username:'昵称',
					context:'靓仔，听说这个月会上线：外卖配送系统全栈教程，在线点播全栈教程，多端客服系统，企业网盘系统',
					image:[{
						src:"https://douyinzcmcss.oss-cn-shenzhen.aliyuncs.com/shengchengqi/datapic/1.jpg"
					},{
						src:"https://douyinzcmcss.oss-cn-shenzhen.aliyuncs.com/shengchengqi/datapic/1.jpg"
					}],
					video:false,
					create_time:1567481668,
					supports:[],
					comments:[]
				},{
					id:2,
					avatar:'/static/images/demo/demo6.jpg',
					username:'昵称',
					context:'靓仔，听说这个月会上线：外卖配送系统全栈教程，在线点播全栈教程，多端客服系统，企业网盘系统',
					image:[],
					video:{
						src:"/static/video/demo.mp4",
						poster:"https://douyinzcmcss.oss-cn-shenzhen.aliyuncs.com/shengchengqi/datapic/1.jpg"
					},
					create_time:1567481668,
					supports:[],
					comments:[]
				}],
				
				faceModal:false,
				faceList:["😀","😁","😂","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","😗","😙","😚","😇","😐","😑","😶","😏","😣","😥","😮","😯","😪","😫","😴","😌","😛","😜","😝","😒","😓","😔","😕","😲","😷","😖","😞","😟","😤","😢","😭","😦","😧","😨","😬","😰","😱","😳","😵","😡","😠"],
				// 评论的对象
				commentIndex:-1
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		},
		methods: {
			// 点击操作菜单
			doAction(e){
				uni.showActionSheet({
					itemList: ['点赞','评论'],
					success: res => {
						if(res.tapIndex === 0){
							this.doSupport(e)
						} else {
							this.content = ''
							this.faceModal = false
							this.commentIndex = e.index
							this.$refs.action.show()
						}
					},
				});
			},
			// 点赞
			doSupport(e){
				e.item.supports.push({
					id:1,
					username:"昵称",
					avatar:'/static/images/demo/demo6.jpg',
				})
			},
			// 添加表情
			addFace(item){
				this.content += item
			},
			// 开启/关闭表情包面板
			changeFaceModal(){
				uni.hideKeyboard()
				setTimeout(()=>{
					this.faceModal = !this.faceModal
				},100)
			},
			// 发送
			send(){
				this.list[this.commentIndex].comments.push({
					id:1,
					username:"昵称",
					content:this.content
				})
				this.$refs.action.hide()
			},
			// 选择发表朋友圈类型
			clickRight(){
				let list = [{
					name:"图文",
					key:"image"
				},{
					name:"短视频",
					key:"video"
				},{
					name:"文字",
					key:"text"
				}]
				uni.showActionSheet({
					itemList: list.map(v=>v.name),
					success: res => {
						uni.navigateTo({
							url: '../add-moment/add-moment?type='+list[res.tapIndex].key,
						});
					},
				});
			}
		}
	}
</script>

<style>

</style>
