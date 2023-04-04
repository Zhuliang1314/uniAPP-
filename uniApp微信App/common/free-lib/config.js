export default {
    // #ifndef H5
    baseUrl:"http://127.0.0.1:7001",
    // #endif
	
    // #ifdef H5
    baseUrl:"/api",
    // #endif
    socketUrl:"ws://127.0.0.1:7001/ws",
	
    env:"dev"
}