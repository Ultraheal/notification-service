import io from 'socket.io-client'

export default {
    data: () => ({
        socket: io('localhost:3001'), // connect to your websocket server
        searchParams: {
            from: 0, // pagination param for start searching
            size: 10, // max size of ElaticSearch response
            user_id: 1 // user id for recieving his notifications
        }
    }),
    mounted () {
        this.socket.on('connect', () => {
            this.socket.send(this.searchParams)
        })
        this.socket.on('message', (searchResult) => {
            console.log('recieved NODE result from Elastic', searchResult)
            this.socket.send(this.searchParams)
        })
    }
}