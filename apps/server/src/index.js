const express = require('express')
const isEmpty = require('lodash/isEmpty')
const udp = require('dgram');
const axios = require('axios')
require('console-stamp')(console, 'HH:MM:ss.l');

const SERVER_LISTEN_PORT = Number(process.env.SERVER_LISTEN_PORT) || 3000
const SERVER_UDP_PORT = Number(process.env.SERVER_UDP_PORT) || 41233
const SERVER_IP_ADDRESS = process.env.SERVER_IP_ADDRESS || 'localhost'
const app = express();
let isUdpServerReady = false
const MESSAGE_RESPONSE_DURATION_IN_MS = 10000
let udpServer = null
const cachedMessage = []

/* ---------------------------------- Udp Server ---------------------------------- */

function createUdpServer() {
    udpServer = udp.createSocket('udp4')

    udpServer.on('error', (error) => {
        console.error('Something wrong when creating udp server. Error message: ' + error);
        udpServer.close();
        isUdpServerReady = false
    })

    udpServer.on('message', handleReceivedMessageFromClient)

    udpServer.on('listening', () => {
        const address = udpServer.address()
        console.log(`Starting UDP server successfully. The UDP server is listening at ${address.address}:${address.port}`);
        isUdpServerReady = true
    });

    udpServer.on('close', () => {
        console.log('The UDP server is closed!');
    });

    udpServer.bind(SERVER_UDP_PORT)
}

function handleReceivedMessageFromClient(data, info) {
    const message = data.toString()
    cachedMessage.push(message)
    console.log(`Received message from client ${info.address}:${info.port} with content: ${message}`)
    udpServer.send(data, info.port, info.address, (error) => {
        if (error){
            printLogs(`Some errors have occurred when sending data to ${info.address}:${info.port}. Error message: ` + error);
        }
    });
}

/* ---------------------------------- Http Server ---------------------------------- */
function createHttpServer(params) {
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

    app.get('/message', (req, res) => {
        const content = req.query.content
        if (!isEmpty(content) && cachedMessage.includes(content)) {
            res.send('success')
            return
        }

        res.status(404);
        res.send('Not Found!')      
    })

    app.listen(SERVER_LISTEN_PORT, () => {
        console.log('Server listening at port %d', SERVER_LISTEN_PORT)
    });
}

function getServerPublicIpAddress() {
    axios.get()
}


function main() {
    let msg = 'Server launched with below configurations\n'
    msg += `SERVER_LISTEN_PORT - ${SERVER_LISTEN_PORT}\n`
    msg += `SERVER_UDP_PORT - ${SERVER_UDP_PORT}\n`
    msg += `SERVER_IP_ADDRESS - ${SERVER_IP_ADDRESS}\n`
    console.log(msg)

    createUdpServer()
    createHttpServer()
}

main()