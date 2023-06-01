import { WebSocketServer } from 'ws'
import * as url from 'url';
const PORT = process.env.PORT || 7072;
class WsProvider {
    constructor() {
        if (!WsProvider._instance) {
            this.wss = new WebSocketServer({ port: PORT });
            this.clients = {};
            this.wss.on('connection', this.onConnection)
            WsProvider._instance = this
        }
        return WsProvider._instance;
    }

    onConnection = (ws, b) => {
        ws.send('Welcome!');
        const url_parts =  url.parse(b.url, true);
        const roomId = url_parts.query.roomId;

        if (roomId) {
            if (this.clients[roomId]) {
                this.clients[roomId].push(ws);
            } else {
                this.clients[roomId] = [ws];
            }
        }

        ws.on('message', (messageAsString) => {
            let msg = '';
            try {
                msg = JSON.parse(messageAsString)?.data;
            } catch (e) {
                console.log(e);
            }
           if (messageAsString) {
               switch (msg) {
                   case 'update answers':
                       return this.clients[url_parts.query.roomId]?.filter(i => i !== ws).forEach(i => i.send('update answers'));
                   case 'update game':
                       return this.clients[url_parts.query.roomId]?.filter(i => i !== ws).forEach(i => i.send('update game'));
                   case 'update room':
                       return this.clients[url_parts.query.roomId]?.filter(i => i !== ws).forEach(i => i.send('update room'));
                   default:
                       console.error('No msg handler!');
               }
           }
        });

        ws.on("close", () => {
            if (roomId) {
                this.clients[roomId] = this.clients[roomId].filter(i => i !== ws);
                if (!this.clients[roomId].length) {
                    delete this.clients[roomId]
                }
            }
        });
    }
}

new WsProvider();