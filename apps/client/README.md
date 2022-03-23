A client app running at customer's workstation to diagnose common network issues which causes the Lightning mode not running on Kobiton devices

# 1. Setup

- Download and install [NodeJS LTS](https://nodejs.org/en/download/) accordingly with your OS. If you already have NodeJS installed, make sure your NodeJS's version is 8.0 or newer
- Download the [apps/client/index.js](https://github.com/kobiton/webrtc-connectivity-check/blob/master/apps/client/index.js) to your machine. Let's say it's downloaded at `/tmp/` (on MacOS) or `C:/tmp/` (on Windows)

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

- Let it running, observe the result and take the suggested action

# 3. Advanced run

> This section is for Kobiton Technical Support staff

The app supports below parameters (with default values) so that we can override on executing if needed

- `SERVER_URL=http://13.213.3.169` : specify the server IP i.e. the `apps/server` runs there
- `CLIENT_UDP_PORT=41234` : specifiy the port (in UDP) that the server app is listening

