#!/bin/bash

port=3000
udp_port=41233

while [ "$1" != "" ]; do
    case $1 in
        --port )          shift
                          port=$1
                          ;;
        --udp-port )      shift
                          udp_port=$1
                          ;;
    esac
    shift
done

echo "Getting the server public IP Address and set to the SERVER_IP_ADDRESS environtment variable"
ip=$(curl -s https://api.ipify.org)
echo "The server public IP Address: $ip"
echo "Build the docker image"
SERVER_IP_ADDRESS=$ip SERVER_UDP_PORT=$udp_port SERVER_LISTEN_PORT=$port docker-compose build --build-arg  webrtc-connectivity-check-server
echo "Launch the webrtc-conectivity-check with the environment variables SERVER_UDP_PORT=$udp_port SERVER_LISTEN_PORT=$port SERVER_IP_ADDRESS=$ip"
SERVER_IP_ADDRESS=$ip SERVER_UDP_PORT=$udp_port SERVER_LISTEN_PORT=$port docker-compose up -d



