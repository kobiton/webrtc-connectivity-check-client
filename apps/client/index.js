const http = require('http');
const udp = require('dgram');

const SERVER_URL = process.env.SERVER_URL || 'http://13.213.3.169'
const CLIENT_UDP_PORT = Number(process.env.CLIENT_UDP_PORT) || 41234
const MESSAGE_RESPONSE_TIMEOUT_IN_MS = 5000

let udpClient = null
const currentDate = new Date()
let timeout = null
let sentMessage = ''

function printLogs(message) {
    console.log(`[${currentDate.toString()}] [LOG]`, message);
}

function printError(err) {
    console.error(`[${currentDate.toString()}] [ERROR]`, err.message ? err.message : err, err);
}

function createUdpServer() {
    udpClient = udp.createSocket('udp4')

    udpClient.on('error', (error) => {
        printLogs('[ERROR] Something wrong when creating udp server. Please re-run the client or inform with customer-support. Error message: ' + error)
        udpClient.close()
        process.exit(-1)
    })

    udpClient.on('message', handleReceivedMessageFromServer)

    udpClient.on('listening', () => {
        const address = udpClient.address()
        printLogs(`Started UDP client at port ${address.port}`)
        beginConnectivityCheck()

    });

    udpClient.on('close', () => {
        printLogs('The UDP server is closed!');
    });

    udpClient.bind(CLIENT_UDP_PORT)
}

function getRequest(url) {
    return new Promise ((resolve, reject) => {
      http.get(url, (res) => {
        const { statusCode } = res;
        let data = ''
        res.on('data', d => {data += d})
        res.on('close', () => {resolve({data, statusCode})})
        res.on('error', (error) => {reject(error)})
      })
    });
}


async function beginConnectivityCheck() {
    // Get server information (udp port, udp address)
    let serverAddress
    const url = `${SERVER_URL}/address`
    try {
        printLogs(`Calling ${url} to retrieve the Kobiton UDP server address`)
        const response = await getRequest(url)
        serverAddress = JSON.parse(response.data)
        printLogs(`The Kobiton UDP server is at ${serverAddress.address}:${serverAddress.port}`)
    } catch (error) {
        printError('Unexpected error when getting server address, please solve and try again', error)
        process.exit(-1)
    }
    
    // Sending timestamp data to server and wait for response
    sentMessage = currentDate.getTime().toString()
    const data = Buffer.from(sentMessage)
    printLogs(`The client is going to send one UDP packet to Kobiton UDP server at ${serverAddress.address}:${serverAddress.port}`)
    udpClient.send(data, Number(serverAddress.port), serverAddress.address, (error) => {
        if (error){
            printError('Unexpected error occurs when sending data. Please solve and try again' , error);
            process.exit(-1)
        }
    });
    setTimeout(async () => {
        // Call api to verify that server received message successfully.
        const response = await getRequest(`${SERVER_URL}/message?content=${sentMessage}`)
        if (response.statusCode === 200) {
            printLogs('The client can send the UDP packet successfully to the Internet since the Kobiton UDP server received the packet')
        }
        else if (response.statusCode === 404) {
            printLogs('[PROBLEM FOUND] The client can NOT send the UDP packet to the Internet. Please verify with your IT departmant that: in the office, the outgoing UDP traffic with destination port range 30000-65000 is enabled on the router and/or the firewall.')
            process.exit(0)
        }

        // Wait for server response.
        timeout = setTimeout(() => {
            printLogs(`The client has been waiting for ${MESSAGE_RESPONSE_TIMEOUT_IN_MS / 1000} seconds but cannot receive the UDP package from the server! This means that the lightning mode feature is not available on your machine. Please verify with your IT departmant that: in the office, the incomming UDP traffic is enabled on the router and/or firewall.`);
            process.exit(0)
        }, MESSAGE_RESPONSE_TIMEOUT_IN_MS);
    }, 1000);

}

function handleReceivedMessageFromServer() {
    if (timeout) {
        clearTimeout(timeout)
        timeout = null
    }

    printLogs(`Your machine received message from Kobiton server successfully. This mean the Lightning mode feature is available now. Congratulation!`)
    process.exit(0)
}

function main() {
    // Print envs
    let msg = 'The client is launched with below environment variables\n'
    msg += `\t- SERVER_URL=${SERVER_URL}\n`
    msg += `\t- CLIENT_UDP_PORT=${CLIENT_UDP_PORT}`
    printLogs(msg)

    // Create udp client.
    createUdpServer()
}

main()

