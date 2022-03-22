const express = require('express')
const isEmpty = require('lodash/isEmpty')
const UdpServer = require('./udp/index')

const SERVER_LISTEN_PORT = Number(process.env.SERVER_LISTEN_PORT) || 3000
const SERVER_UDP_PORT = Number(process.env.SERVER_UDP_PORT) || 41233
const SERVER_IP_ADDRESS = process.env.SERVER_IP_ADDRESS || 'localhost'
const app = express();
let isUdpServerReady = false

function main() {
    let msg = 'Server launched with below configurations\n'
    msg += `SERVER_LISTEN_PORT - ${SERVER_LISTEN_PORT}\n`
    msg += `SERVER_UDP_PORT - ${SERVER_UDP_PORT}\n`
    msg += `SERVER_IP_ADDRESS - ${SERVER_IP_ADDRESS}\n`
    console.log(msg)

    const udpServer = new UdpServer('udp-server')

    try {
        udpServer.createUdpServer(SERVER_UDP_PORT)
        udpServer.on('listening', () => {isUdpServerReady = true})
        udpServer.on('close', () => {isUdpServerReady = false})
    } catch (error) {
        console.log('Something wrong when creating udp server: ', error);
    }
    
    app.get('/address', (req, res) => {
        if (!isUdpServerReady) {
            res.status(500)
            res.send('Something went wrong. The udp server is not ready!')
            return
        }

        res.send({
            address: SERVER_IP_ADDRESS,
            port: SERVER_UDP_PORT
        })
    })

    app.get('/client', (req, res) => {
        if (!isUdpServerReady) {
            res.status(500)
            res.send('Something went wrong. The udp server is not ready!')
            return
        }

        const address = req.query.address
        const port = Number(req.query.port)
        if (isEmpty(address) || isNaN(port)) {
            res.status(400)
            res.send('Invalid client address or port data!')
            return
        }
        
        console.log('Received message from client: ', JSON.stringify({address, port}))
        try {
            udpServer.startStreamingData('Sample data', port, address)
        } catch (error) {
            res.status(500)
            res.send('Internal server error')
            console.log(error)
            return
        }

        res.send('Success')
    });

    app.get('/clear', (req, res) => {
        udpServer.clearAllStreamingMessage()
        res.send('success')
    })

    app.listen(SERVER_LISTEN_PORT, () => {
        console.log('Server listening at port %d', SERVER_LISTEN_PORT)
    });
}

main()