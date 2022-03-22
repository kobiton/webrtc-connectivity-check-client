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
- Install docker
- Run `docker build -t <image-name>:<image-tag>` to build docker image
- Run `docker run -d  -e SERVER_LISTEN_PORT=3000 -e SERVER_UDP_PORT=41233 -e SERVER_IP_ADDRESS=localhost -p 3000:3000 -p 41233:41233 <image-name>:<image-tag>`