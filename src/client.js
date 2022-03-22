const axios = require('axios')
const toNumber = require('lodash/toNumber')
const UdpServer = require('./udp/index.js')

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'
const CLIENT_UDP_PORT = toNumber(process.env.CLIENT_UDP_PORT) || 41234
const CLIENT_IP_ADDRESS = process.env.CLIENT_IP_ADDRESS || 'localhost'
const udpClient = new UdpServer('upd-client')

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
        console.log('Cannot get udp server address. Exit!');
        return
    }
    
    console.log('Received udp server address: ', serverAddress);
    const getServerInfoUrl = encodeURI(`${SERVER_URL}/client?address=${CLIENT_IP_ADDRESS}&port=${CLIENT_UDP_PORT}`)

    try {
        await axios.get(getServerInfoUrl)
        console.log('Sent client address to server.');

    } catch (error) {
        console.log('Error when sending client address to server: ', error);
        udpClient.closeUdpServer()
    }
}

async function main() {
    // Print envs
    let msg = 'Client launched with below configurations\n'
    msg += `SERVER_URL - ${SERVER_URL}\n`
    msg += `CLIENT_UDP_PORT - ${CLIENT_UDP_PORT}\n`
    msg += `CLIENT_IP_ADDRESS - ${CLIENT_IP_ADDRESS}\n`
    console.log(msg)

    // Create udp client.
    try {
        udpClient.createUdpServer(CLIENT_UDP_PORT)
        udpClient.on('listening', startConnection)
    } catch (error) {
        console.log('Something wrong when creating udp client: ', error);
    }
    
}

main()