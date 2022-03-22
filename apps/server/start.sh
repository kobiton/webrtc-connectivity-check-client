#!bin bash
echo "Getting the server public IP Address and set to the SERVER_IP_ADDRESS environtment variable"
ip=$(curl -s https://api.ipify.org)
echo "The server public IP Address: $ip"
echo "Build the docker image"
SERVER_IP_ADDRESS=$SERVER_IP_ADDRESS docker-compose build --build-arg  webrtc-connectivity-check-server
echo "Launch the webrtc-conectivity-check with the default environment variables SERVER_UDP_PORT=41233 SERVER_LISTEN_PORT=3000"
SERVER_IP_ADDRESS=$SERVER_IP_ADDRESS docker-compose up -d



