const http = require('http')
const udp = require('dgram');



const SERVER_URL = process.env.SERVER_URL || 'http://13.213.3.169'
const CLIENT_UDP_PORT = Number(process.env.CLIENT_UDP_PORT) || 41234
let udpClient = null
const MESSAGE_RESPONSE_TIMEOUT_IN_MS = 10000
const currentDate = new Date()
let timeout = null
let sentMessage = ''
let sendMessageTimout = null

function printLogs(message) {
    console.log(`[${currentDate.toString()}] [LOG] ${message}`)
}

function createUdpServer() {
    udpClient = udp.createSocket('udp4')

    udpClient.on('error', (error) => {
        printLogs('[ERROR] Something wrong when creating udp server. Please re-run the client or inform with customer-support. Error message: ' + error);
        udpClient.close();
    })

    udpClient.on('message', handleReceivedMessageFromServer)

    udpClient.on('listening', () => {
        const address = udpClient.address()
        printLogs(`Starting UDP server successfully. The UDP server is listening at ${address.address}:${address.port}`);
        beginConnectivityCheck()

    });

    udpClient.on('close', () => {
        printLogs('The UDP server is closed!');
    });

    udpClient.bind(CLIENT_UDP_PORT)
}

async function getRequest(url) {
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
    try {
        const response = await getRequest(`${SERVER_URL}/address`)
        serverAddress = JSON.parse(response.data)
        printLogs(`The client is successfully received the udp server address: ${serverAddress.address}:${serverAddress.port} from Kobiton server.`)
    } catch (error) {
        printLogs('[ERROR] Something went wrong when getting server address. Please check your internet connection or send this message to technical support. Error message: ', error.message)
        return
    }
    
    // Sending timestamp data to server and wait for response
    sentMessage = currentDate.getTime().toString()
    const data = Buffer.from(sentMessage)
    udpClient.send(data, Number(serverAddress.port), serverAddress.address, (error) => {
        if (error){
            printLogs('Some errors have occurred when sending data: ' + error);
        }
        else {
            printLogs(`Sent message to the udp server at address: ${serverAddress.address}:${serverAddress.port} with content: ${sentMessage}`)
        }
    });

    timeout = setTimeout(() => {
        printLogs(`The client has been waited for ${MESSAGE_RESPONSE_TIMEOUT_IN_MS} but cannot receive udp package from server! This mean that lightning mode feature is not
        available on your machine. Please verify your firewall setup or contact to Kobiton Technical Support for more information!`);
    }, MESSAGE_RESPONSE_TIMEOUT_IN_MS);
    printLogs(`The client is waiting for response from Kobiton server...`)
    sendMessageTimout = setTimeout(async () => {
        // Call api to verify that server received message successfully.
        const response = await getRequest(`${SERVER_URL}/message?content=${sentMessage}`)
        if (response.statusCode === 200) {
            printLogs(`The Kobiton server is successfully received message from client!`)
        }
        else if (response.statusCode === 404) {
            printLogs(`The Kobiton server cannot received message from client. Maybe there are some blocks from your machine. Please check your firewall or contact to our technical support for more information!`)
            clearTimeout(timeout)
            return
        }
    }, 1000);
}

function handleReceivedMessageFromServer() {
    if (timeout) {
        clearTimeout(timeout)
        timeout = null
    }

    clearTimeout(sendMessageTimout)
    printLogs(`Your machine received message from Kobiton server successfully. This mean the Lightning mode feature is available now. Congratulation!`)
}

async function main() {
    // Print envs
    let msg = 'Client launched with below configurations\n'
    msg += `SERVER_URL - ${SERVER_URL}\n`
    msg += `CLIENT_UDP_PORT - ${CLIENT_UDP_PORT}\n`
    printLogs(msg)

    // Create udp client.
    createUdpServer()
}

main()