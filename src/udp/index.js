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
        if (isNaN(udpPort)) {
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
    }

    startStreamingData = (message, port, address) => {
        const data = Buffer.from(message)
        const id = `${address}:${port}`

        if (this.intervals[id]) {
            return
        }

        this.printLogs('Start streaming data to client with address: ' + id);
        const interval = setInterval(() => {
            this.server.send(data, port, address, (error) => {
                if (error){
                    this.printLogs('Some errors have occurred when sending data: ' + error);
                }
                else {
                    this.printLogs(`Sent data to ${address}:${port} with content: ${message}`);
                }
            });
        }, 1000);
        this.intervals[id] = interval
        setTimeout(this.stopStreamingData.bind(this, id), 10000);

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