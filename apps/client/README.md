## Prerequisite
- Install Node v17.x or newer
## Getting started
### Configurations
- `SERVER_URL`: The address of the webrtc-connectivity-check server (default is `http://localhost:3000`)
- `CLIENT_UDP_PORT`: The listen port for the webrtc-connectivity-check client (default is `41234`)
### How to run
- Go to `apps/client` folder
- Run `npm install` to install all dependencies
- Run `SERVER_URL='http://localhost:3000' CLIENT_UDP_PORT='41234' npm start` to run webrtc-connectivity-check
### How to send back the result
- Copy all the logs that printed on the console and send back to us