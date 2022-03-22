const axios = require('axios')
const UdpServer = require('../server/src/udp/index.js')
require('console-stamp')(console, 'HH:MM:ss.l');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'
const CLIENT_UDP_PORT = Number(process.env.CLIENT_UDP_PORT) || 41234
const udpClient = new UdpServer('upd-client')
let timeout = null
const MESSAGE_RESPONSE_TIMEOUT_IN_MS = 10000

async function getClientOutboundIpAddress() {
    try {
        const response = await axios.get('https://api.ipify.org')
        console.log('Client public ip address: ', response.data);
        return response.data
    } catch (error) {
        console.log('Something went wrong when getting client outbound ip address: ', error.message);
    }
}

async function getServerInformation() {
    try {
        const response = await axios.get(`${SERVER_URL}/address`)
        serverAddress = response.data
    } catch (error) {
        console.log('Something went wrong when getting server address: ', error.message);
        serverAddress = null
    }

    return serverAddress
}

async function startConnection() {
    const serverAddress = await getServerInformation()
    if(!serverAddress) {
        console.log('Cannot get udp server address. Exit!')
        return
    }
    
    console.log('Received udp server address: ', serverAddress)
    const clientIpAddress = await getClientOutboundIpAddress()
    const getServerInfoUrl = encodeURI(`${SERVER_URL}/client?address=${'0.0.0.0'}&port=${CLIENT_UDP_PORT}`)

    try {
        await axios.get(getServerInfoUrl)
        console.log('Sent client address to server.');

    } catch (error) {
        console.log('Error when sending client address to server: ', error);
        udpClient.closeUdpServer()
    }

    // Sending sample data to server and wait for response
    udpClient.sendMessage('sample request data', serverAddress.port, serverAddress.address)
    timeout = setTimeout(() => {
        console.log('Timeout! Cannot receive udp package from server!');
    }, MESSAGE_RESPONSE_TIMEOUT_IN_MS);
}

function handleReceivedMessageFromServer() {
    if (timeout) {
        clearTimeout(timeout)
        timeout = null
    }
}

async function main() {
    // Print envs
    let msg = 'Client launched with below configurations\n'
    msg += `SERVER_URL - ${SERVER_URL}\n`
    msg += `CLIENT_UDP_PORT - ${CLIENT_UDP_PORT}\n`
    console.log(msg)

    // Create udp client.
    try {
        udpClient.createUdpServer(CLIENT_UDP_PORT, )
        udpClient.on('listening', startConnection)
        udpClient.on('message', handleReceivedMessageFromServer)
    } catch (error) {
        console.log('Something wrong when creating udp client: ', error);
    }
    
}

main()