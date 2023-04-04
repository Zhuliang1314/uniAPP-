import $U from './util.js';
import $H from './request.js';
class chat {
	constructor(arg) {
		this.url = arg.url
		this.isOnline = false
		this.socket = null
		// 获取当前用户相关信息
		let user = $U.getStorage('user')
		this.user = user ? JSON.parse(user) : {},
			// 初始化聊天对象
			this.TO = false;

		// 连接和监听
		if (this.user.token) {
			this.connectSocket()
		}
	}
	// 连接socket
	connectSocket() {
		this.socket = uni.connectSocket({
			url: this.url + "?token=" + this.user.token,
			complete: () => {}
		})
		// 监听连接成功
		this.socket.onOpen(() => this.onOpen())
		// 监听接收信息
		this.socket.onMessage((res) => this.onMessage(res))
		// 监听断开
		this.socket.onClose(() => this.onClose())
		// 监听错误
		this.socket.onError(() => this.onError())
	}
	// 监听打开
	onOpen() {
		// 用户上线
		this.isOnline = true
		console.log('socket连接成功')
		// 获取用户离线消息
		this.getMessage()
	}
	// 获取离线消息
	getMessage() {
		$H.post('/chat/getmessage')
	}
	// 监听关闭
	onClose() {
		// 用户下线
		this.isOnline = false
		this.socket = null
		console.log('socket连接关闭')
	}
	// 监听连接错误
	onError() {
		// 用户下线
		this.isOnline = false
		this.socket = null
		console.log('socket连接错误')
	}
	// 监听接收消息
	onMessage(data) {
		let res = JSON.parse(data.data)
		console.log('监听接收消息', res)
		// 错误
		if (res.msg === 'fail') {
			return uni.showToast({
				title: res.data,
				icon: 'none'
			});
		}
		// 处理消息
		this.handleOnMessage(res.data)
	}
	// 处理消息
	async handleOnMessage(message) {
		// 添加消息记录到本地存储中
		let {
			data
		} = this.addChatDetail(message, false)
		// 更新会话列表
		this.updateChatList(data, false)
		// 全局通知
		uni.$emit('onMessage', data)
	}
	// 关闭连接
	close() {
		this.socket.close()
	}
	// 创建聊天对象
	createChatObject(detail) {
		this.TO = detail
		console.log('创建聊天对象', this.TO);
	}
	// 销毁聊天对象
	destoryChatObject() {
		this.TO = false
		console.log('销毁聊天对象');
	}
	// 断线重连提示
	reconnectConfirm() {
		uni.showModal({
			content: '你已经断线，是否重新连接？',
			confirmText: "重新连接",
			success: (res) => {
				if (res.confirm) {
					this.connectSocket()
				}
			}
		});
	}
	// 验证是否上线
	checkOnline() {
		if (!this.isOnline) {
			// 断线重连提示
			this.reconnectConfirm()
			return false
		}
		return true
	}
	// 组织发送信息格式
	formatSendData(params) {
		return {
			id: 0, // 唯一id，后端生成，用于撤回指定消息
			from_avatar: this.user.avatar, // 发送者头像
			from_name: this.user.nickname || this.user.username, // 发送者昵称
			from_id: this.user.id, // 发送者id
			to_id: this.TO.id, // 接收人/群 id
			to_name: this.TO.name, // 接收人/群 名称
			to_avatar: this.TO.avatar, // 接收人/群 头像
			chat_type: this.TO.chat_type, // 接收类型
			type: params.type, // 消息类型
			data: params.data, // 消息内容
			options: params.options ? params.options : {}, // 其他参数
			create_time: (new Date()).getTime(), // 创建时间
			isremove: 0, // 是否撤回
			sendStatus: params.sendStatus ? params.sendStatus : "pending" // 发送状态，success发送成功,fail发送失败,pending发送中
		}
	}
	// 发送消息
	send(message) {
		return new Promise((result, reject) => {
			// 添加消息历史记录
			let {
				k
			} = this.addChatDetail(message)
			// 更新会话列表
			this.updateChatList(message)
			// 验证是否上线
			if (!this.checkOnline()) return reject('未上线')
			// 提交到后端
			$H.post('/chat/send', {
				to_id: this.TO.id,
				chat_type: this.TO.chat_type,
				type: message.type,
				data: message.data,
			}).then(res => {
				// 发送成功
				message.id = res.id
				message.sendStatus = 'success'
				// 更新指定历史记录
				console.log('更新指定历史记录', message);
				this.updateChatDetail(message, k)
				result(res)
			}).catch(err => {
				// 发送失败
				message.sendStatus = 'fail'
				// 更新指定历史记录
				this.updateChatDetail(message, k)
				// 断线重连提示
				reject(err)
			})
		})
	}
	// 添加聊天记录
	addChatDetail(message, isSend = true) {
		console.log('添加聊天记录');
		// 获取对方id
		let id = message.chat_type === 'user' ? (isSend ? message.to_id : message.from_id) : message.to_id
		// key值：chatDetail_当前用户id_会话类型_接收人/群id
		let key = `chatDetail_${this.user.id}_${message.chat_type}_${id}`
		// 获取原来的聊天记录
		let list = this.getChatDetail(key)
		console.log('获取原来的聊天记录', list)
		// 标识
		message.k = 'k' + list.length
		list.push(message)
		// 加入缓存
		console.log('加入缓存', key)
		this.setStorage(key, list)
		// 返回
		return {
			data: message,
			k: message.k
		}
	}
	// 更新指定历史记录
	async updateChatDetail(message, k, isSend = true) {
		// 获取对方id
		let id = message.chat_type === 'user' ? (isSend ? message.to_id : message.from_id) : message.to_id
		// key值：chatDetail_当前用户id_会话类型_接收人/群id
		let key = `chatDetail_${this.user.id}_${message.chat_type}_${id}`
		console.log('key值', key)
		// 获取原来的聊天记录
		let list = this.getChatDetail(key)
		console.log('获取原来的聊天记录', list)
		// 根据k查找对应聊天记录
		let index = list.findIndex(item => item.k === k)
		console.log('根据k查找对应聊天记录', index)
		if (index === -1) return;
		list[index] = message
		// 存储
		this.setStorage(key, list)
	}
	// 获取聊天记录
	getChatDetail(key = false) {
		key = key ? key : `chatDetail_${this.user.id}_${this.TO.chat_type}_${this.TO.id}`
		return this.getStorage(key)
	}

	/**
	 {
	 	id:1, // 接收人/群 id
	 	chat_type:'user', // 接收类型 user单聊 group群聊
	 	avatar:'', // 接收人/群 头像
	 	name:'昵称', // 接收人/群 昵称
	 	update_time:(new Date()).getTime(), // 最后一条消息的时间戳
	 	data:"最后一条消息内容", // 最后一条消息内容
	 	type:'text', 		   // 最后一条消息类型
	 	noreadnum:0, // 未读数
	 	istop:false, // 是否置顶
	 	shownickname:0, // 是否显示昵称
	 	nowarn:0, // 消息免打扰
	 	strongwarn:0, // 是否开启强提醒
		
		user_id:0, // 群管理员id
		remark:"公告", // 群公告
		invite_confirm:0, // 邀请确认
	 }
	 * **/
	// 更新会话列表
	updateChatList(message, isSend = true) {
		// 获取本地存储会话列表
		let list = this.getChatList()
		// 是否处于当前聊天中
		let isCurrentChat = false
		// 接收人/群 id/头像/昵称
		let id = 0
		let avatar = ''
		let name = ''

		// 判断私聊还是群聊
		if (message.chat_type === 'user') { // 私聊
			// 聊天对象是否存在
			isCurrentChat = this.TO ? (isSend ? this.TO.id === message.to_id : this.TO.id === message.from_id) :
				false

			id = isSend ? message.to_id : message.from_id
			avatar = isSend ? message.to_avatar : message.from_avatar
			name = isSend ? message.to_name : message.from_name
		} else { // 群聊
			isCurrentChat = this.TO && (this.TO.id === message.to_id)
			id = message.to_id
			avatar = message.to_avatar
			name = message.to_name
		}

		// 会话是否存在
		let index = list.findIndex(item => {
			return item.chat_type === message.chat_type && item.id === id
		})
		// 最后一条消息展现形式
		// let data = isSend ? message.data : `${message.from_name}: ${message.data}`
		let data = message.data.length > 18 ? message.data.slice(0, 17) + '...' : message.data

		data = isSend ? data : `${message.from_name}: ${data}`
		// 会话不存在，创建会话
		// 未读数是否 + 1
		let noreadnum = (isSend || isCurrentChat) ? 0 : 1
		if (index === -1) {
			let chatItem = {
				id, // 接收人/群 id
				chat_type: message.chat_type, // 接收类型 user单聊 group群聊
				avatar, // 接收人/群 头像
				name, // 接收人/群 昵称
				update_time: (new Date()).getTime(), // 最后一条消息的时间戳
				data, // 最后一条消息内容
				type: message.type, // 最后一条消息类型
				noreadnum, // 未读数
				istop: false, // 是否置顶
				shownickname: false, // 是否显示昵称
				nowarn: false, // 消息免打扰
				strongwarn: false, // 是否开启强提醒
			}
			// 群聊
			if (message.chat_type === 'group' && message.group) {
				chatItem.shownickname = true
				chatItem.name = message.to_name
				chatItem = {
					...chatItem,
					user_id: message.group.user_id, // 群管理员id
					remark: "", // 群公告
					invite_confirm: 1, // 邀请确认
				}
			}
			list.unshift(chatItem)
		} else { // 存在，更新会话
			// 拿到当前会话
			let item = list[index]
			// 更新该会话最后一条消息时间，内容，类型
			item.update_time = (new Date()).getTime()
			item.name = message.to_name
			item.data = data
			item.type = message.type
			// 未读数更新
			item.noreadnum += noreadnum
			// 置顶会话
			list = this.listToFirst(list, index)
		}
		// 存储
		let key = `chatlist_${this.user.id}`
		this.setStorage(key, list)
		// 更新未读数
		this.updateBadge(list)
		// 通知更新vuex中的聊天会话列表
		uni.$emit('onUpdateChatList', list)
		return list
	}
	// 更新未读数
	async updateBadge(list = false) {
		// 获取所有会话列表
		list = list ? list : this.getChatList()
		// 统计所有未读数
		let total = 0
		list.forEach(item => {
			total += item.noreadnum
		})
		// 设置底部导航栏角标
		if (total > 0) {
			uni.setTabBarBadge({
				index: 0,
				text: total <= 99 ? total.toString() : '99+'
			})
		} else {
			uni.removeTabBarBadge({
				index: 0
			})
		}
		uni.$emit('totalNoreadnum', total)
	}
	//更新指定会话 
	async updateChatItem(where, data) {
		// 获取所有会话列表
		let list = this.getChatList()
		// 找到当前会话
		let index = list.findIndex(item => item.id === where.id && item.chat_type === where.chat_type)
		if (index === -1) return;
		list[index].noreadnum = 0
		
		//更新数据
		list[index] = data
		let key = `chatlist_${this.user.id}`
		this.setStorage(key, list)
		// 更新会话列表状态
		uni.$emit('onUpdateChatList', list)
	}
	// 读取会话
	async readChatItem(id, chat_type) {
		// 获取所有会话列表
		let list = this.getChatList()
		// 找到当前会话
		let index = list.findIndex(item => item.id === id && item.chat_type === chat_type)
		if (index !== -1) {
			list[index].noreadnum = 0
			let key = `chatlist_${this.user.id}`
			this.setStorage(key, list)
			// 重新获取总未读数
			this.updateBadge()
			// 更新会话列表状态
			uni.$emit('onUpdateChatList', list)
		}
	}
	// 删除指定会话
	async removeChatItem(id, chat_type) {
		// 获取所有会话列表
		let list = this.getChatList()
		// 找到当前会话
		let index = list.findIndex(item => item.id === id && item.chat_type === chat_type)
		if (index !== -1) {
			list.splice(index, 1)

			let key = `chatlist_${this.user.id}`
			this.setStorage(key, list)
			// 重新获取总未读数
			this.updateBadge()
			// 更新会话列表状态
			uni.$emit('onUpdateChatList', list)
		}
	}
	// 获取本地存储会话列表
	getChatList() {
		let key = `chatlist_${this.user.id}`
		return this.getStorage(key)
	}
	// 获取指定会话
	getChatListItem(id, chat_type) {
		// 获取所有会话列表
		let list = this.getChatList()
		// 找到当前会话
		let index = list.findIndex(item => item.id === id && item.chat_type === chat_type)
		if (index !== -1) {
			return list[index]
		}
		return false
	}
	// 获取存储
	getStorage(key) {
		let list = $U.getStorage(key)
		return list ? JSON.parse(list) : []
	}
	// 设置存储
	setStorage(key, value) {
		return $U.setStorage(key, JSON.stringify(value))
	}
	// 数组置顶
	listToFirst(arr, index) {
		if (index != 0) {
			arr.unshift(arr.splice(index, 1)[0]);
		}
		return arr;
	}
}
export default chat
