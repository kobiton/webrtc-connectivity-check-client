# webrtc-connectivity-check
A simple CLI tool to check that the WebRTC can work in your network or not

## Prerequisite
- Install Node v17.x or newer
- Run `npm install` to install dependencies.
## Getting started
### Client
1. Configurations
- `SERVER_URL`: The address of the webrtc-connectivity-check server (default is `http://localhost:3000`)
- `CLIENT_UDP_PORT`: The listen port for the webrtc-connectivity-check client (default is `41234`)
- `CLIENT_IP_ADDRESS`: The ip address of the client's machine (default is `localhost`)
2. Steps to run
- Run `npm install` to install all dependencies.
- Run `SERVER_URL='http://localhost:3000' CLIENT_UDP_PORT='41234' CLIENT_IP_ADDRESS='localhost' npm run start-client` to run webrtc-connectivity-check
### Server
1. Configurations
- `SERVER_LISTEN_PORT`: The listen port for the webrtc-connectivity-check server (default is `3000`)
- `SERVER_UDP_PORT`: The listen port for the webrtc-connectivity-check client service (default is `41233`)
- `SERVER_IP_ADDRESS`: The ip address of the server's machine (default is `localhost`)
2. Steps to run
- Run `npm install` to install all dependencies.
- Run `SERVER_LISTEN_PORT='3000' SERVER_UDP_PORT='41233' SERVER_IP_ADDRESS='localhost' npm run start-server` to run webrtc-connectivity-check
