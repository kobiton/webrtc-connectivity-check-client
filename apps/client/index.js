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

function printError(message, err) {
    console.error(`[${currentDate.toString()}] [ERROR]`, message, err.message ? err.message : err, err);
}

function createUdpServer() {
    udpClient = udp.createSocket('udp4')

    udpClient.on('error', (error) => {
        printError('Something wrong when creating udp server. Please re-run the client or inform with customer-support. Error message: ', error)
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
    printLogs('[CHECK 1] Can the client send UDP packets to the Internet ?')
    printLogs(`The client is going to send an UDP packet to Kobiton UDP server at ${serverAddress.address}:${serverAddress.port}`)
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
            printLogs('[CHECK 1 - PASSED] The client can send the UDP packet successfully to the Internet since the Kobiton UDP server receives the packet')
        }
        else if (response.statusCode === 404) {
            printLogs('[CHECK 1 - FAILED] The client can NOT send the UDP packet to the Internet. Please verify with your IT departmant that: in the office, the outgoing UDP traffic to the Internet with destination port range 30000-65000 is enabled on the router and/or the firewall.')
        }
        
        printLogs('[CHECK 2] Can the client receive UDP packets from the Internet (sent by Kobiton UDP server) ?')

        // Wait for server response.
        timeout = setTimeout(() => {
            printLogs(`[CHECK 2 - FAILED] The client can NOT receive the UDP packet from the Internet. Please verify with your IT departmant that:
  * In the office, the incoming UDP traffic from the Internet with source port range 30000-65000 is enabled on the router and/or the firewall.
  * In the office, the firewall / router enables Symmetric NAT (see https://en.wikipedia.org/wiki/Network_address_translation) so that the Kobiton server is able to send UDP packets to the client which is behind the firewall.`)
            bye()
        }, MESSAGE_RESPONSE_TIMEOUT_IN_MS);
    }, 1000);

}

function handleReceivedMessageFromServer() {
    if (timeout) {
        clearTimeout(timeout)
        timeout = null
    }

    printLogs('[CHECK 2 - PASSED] The client receives an UDP packet from Kobiton UDP server.')
    bye()
}

function bye() {
    printLogs('')
    printLogs("The check process completes. If you encounter any issue, please follow the suggestion, solve it and re-run again to verify it's fixed")
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

