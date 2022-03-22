const udp = require('dgram');
const EventEmitter = require('events');

module.exports = class UdpServer extends EventEmitter {
    constructor(namespace) {
        super()
        this.server = null
        this.namespace = namespace
        this.intervals = {}
    }

    createUdpServer = (udpPort) => {
        if (isNaN(udpPort) || udpPort < 0 || udpPort > 65535) {
            console.log('Invalid UDP port!');
            return
        }

        this.server = udp.createSocket('udp4')
    
        this.server.on('error', (error) => {
            this.printLogs('Something wrong when create udp server: ' + error);
            this.server.close();
        })
    
        this.server.on('message', this.handleUdpMessage)

        this.server.on('listening', () => {
            const address = this.server.address();
            this.emit('listening')
            this.printLogs(`UDP server listening at ${address.address}:${address.port}`);
        });

        this.server.on('close', () => {
            this.emit('close')
            this.clearAllStreamingMessage()
            this.printLogs('Socket is closed !');
        });

        this.server.on('connect', () => {
            this.printLogs('Connected to UDP server')
            this.emit('connect')
        })


        this.server.bind(udpPort)
    }

    handleUdpMessage = (msg, info) => {
        this.printLogs(`Received upd data from ${info.address}:${info.port} with content: ${msg.toString()}`);
        this.emit('message', {msg, info})
    }

    startStreamingData = (message, port, address, duration) => {
        const id = `${address}:${port}`

        if (this.intervals[id]) {
            return
        }

        this.printLogs('Start streaming data to client with address: ' + id);
        const interval = setInterval(() => {
            this.sendMessage(message, port, address)
        }, 1000);
        this.intervals[id] = interval
        setTimeout(this.stopStreamingData.bind(this, id), duration);
    }

    sendMessage = (message, port, address) => {
        const data = Buffer.from(message)
        this.server.send(data, port, address, (error) => {
            if (error){
                this.printLogs('Some errors have occurred when sending data: ' + error);
            }
            else {
                this.printLogs(`Sent data to ${address}:${port} with content: ${message}`);
            }
        });
    }

    stopStreamingData = (id) => {
        if (!this.intervals[id]) {
            return
        }

        clearInterval(this.intervals[id])
        delete this.intervals[id]
        this.printLogs('Stop streaming data to client with address: ' + id);
    }

    closeUdpServer = () => {
        if (!this.server) {
            return
        }

        this.server.close()
    }

    clearAllStreamingMessage = () => {
        Object.keys(this.intervals).forEach((key) => {
            clearInterval(this.intervals[key])
        })
    }

    printLogs = (message) => {
        console.log(`${this.namespace}: ${message}`)
    }
}