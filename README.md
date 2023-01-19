A NodeJS-based CLI client app runs in a computer inside the organization network to verify whether the UDP hole-punching (with Kobiton Data Center) is available

# 1. Setup

- The client app will communicate with the server running at Kobiton Data Center. Below is the network requirement for it to work, please make sure they're in allowlist of your firewall

| Destination address        | Application protocol            | Comment  |
| --- |: --- :| --- :|
| `webrtc-check.kobiton.com:80`      | HTTP | The web service served requests from the client app 																	|
| `webrtc-check.kobiton.com:41234`   | UDP  |   The UDP destination port that the client app uses to check the outgoing UDP packets |

- Download and install [NodeJS version 8.x](https://nodejs.org/en/download/) accordingly with your OS. If you already have NodeJS installed, make sure your NodeJS's version is 8.0 or newer
- Download the [./index.js](https://raw.githubusercontent.com/kobiton/webrtc-connectivity-check-client/main/index.js) to your machine. Let's say it's downloaded at `/tmp/` (on MacOS) or `C:/tmp/` (on Windows)

# 2. Run the client app

> Make sure your machine stays inside the organization network i.e. in the office so that the client app can report correct network condition

- Open the Terminal app (on MacOS) or Command Prompt (on Windows)
- Navigate to the directory having the `index.js` as below

```
cd /tmp (on MacOS)
C:/tmp (on Windows)
```

- Execute the client app as below

```
node index.js
```

- Let it running, observe the result and follow the suggested action on the screen

# 3. Advanced run

> This section is for Kobiton Technical Support staff

The app supports below parameters (with default values) so that we can override on executing if needed

- `SERVER_URL=http://13.213.3.169` : specify the server IP i.e. the `apps/server` runs there
- `CLIENT_UDP_PORT=41234` : specifiy the port (in UDP) that the server app is listening

