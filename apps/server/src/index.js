const express = require('express')
const isEmpty = require('lodash/isEmpty')
const udp = require('dgram');
require('console-stamp')(console, 'HH:MM:ss.l');

const SERVER_LISTEN_PORT = Number(process.env.SERVER_LISTEN_PORT) || 3000
const SERVER_UDP_PORT = Number(process.env.SERVER_UDP_PORT) || 41233
const SERVER_IP_ADDRESS = process.env.SERVER_IP_ADDRESS || 'localhost'
const app = express();
let isUdpServerReady = false
const MESSAGE_RESPONSE_DURATION_IN_MS = 5000
let udpServer = null
let cachedMessage = []
let clearMessageTimeout = null

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
    const sendMessage = new Date().getTime().toString()
    console.log(`Received message from client ${info.address}:${info.port} with content: ${message}`)
    setTimeout(() => {
        udpServer.send(Buffer.from(sendMessage), info.port, info.address, (error) => {
            if (error){
                console.log(`Some errors have occurred when sending data to ${info.address}:${info.port}. Error message: ` + error);
            }
            else {
                console.log(`Sent message to the udp client at address: ${info.address}:${info.port} with content: ${sendMessage}`)
            }
        });
    }, MESSAGE_RESPONSE_DURATION_IN_MS);
}

function clearCachedMessage() {
    cachedMessage = []
    clearTimeout(clearMessageTimeout)
    console.log('Clear cached message');
    clearMessageTimeout = setTimeout(clearCachedMessage, 24 * 60 * 60 * 1000);
}

/* ---------------------------------- Http Server ---------------------------------- */
function createHttpServer(params) {
    app.get('/address', (req, res) => {
        if (!isUdpServerReady) {
            res.status(500);
            res.send('Something went wrong. The udp server is not ready!');
        }
        else {
            res.json({
                address: SERVER_IP_ADDRESS,
                port: SERVER_UDP_PORT
            });
        }

        res.end();
    })

    app.get('/message', (req, res) => {
        const content = req.query.content
        if (!isEmpty(content) && cachedMessage.includes(content)) {
            res.status(200);
        }
        else {
            res.status(404);
        }

        res.end();
    })

    app.listen(SERVER_LISTEN_PORT, () => {
        console.log('Server listening at port %d', SERVER_LISTEN_PORT)
    });
}

function main() {
    let msg = 'Server launched with below configurations\n'
    msg += `SERVER_LISTEN_PORT - ${SERVER_LISTEN_PORT}\n`
    msg += `SERVER_UDP_PORT - ${SERVER_UDP_PORT}\n`
    msg += `SERVER_IP_ADDRESS - ${SERVER_IP_ADDRESS}\n`
    console.log(msg)

    clearCachedMessage()

    createUdpServer()
    createHttpServer()
}

main()
