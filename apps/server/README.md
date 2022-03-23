## Prerequisite
- Install Node v17.x or newer
## Getting started
### Configurations
- `SERVER_LISTEN_PORT`: The listen port for the webrtc-connectivity-check server (default is `3000`)
- `SERVER_UDP_PORT`: The listen port for the webrtc-connectivity-check client service (default is `41233`)
- `SERVER_IP_ADDRESS`: The ip address of the server's machine (default is `localhost`)
### Run at local
- Go to `apps/server` folder
- Run `npm install` to install all dependencies
- Run `SERVER_LISTEN_PORT='3000' SERVER_UDP_PORT='41233' SERVER_IP_ADDRESS='localhost' npm start` to run webrtc-connectivity-check
### How to Deploy
- Install docker, docker-compose
- Go to `cd apps/server` folder
- Run `Bash start.sh --port 3000 --udp-port 41233` to deploy server