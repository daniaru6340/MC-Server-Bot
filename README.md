# MC SERVER BOT

MC-Server-Bot is a Discord bot designed to provide real-time status updates and information for a Minecraft Java Edition server. It's built using discord.js and leverages an [mcstatus.io](https://mcstatus.io/docs) to fetch server info, including its online status, player count, and version.

## Key Features ✨

- Server Status: Check if the Minecraft server is online or offline.

- Detailed Info: Get a summary of the server, including its version, address, and player count.

- Player List: View a list of all players currently connected to the server.

## Commands 💻

The bot uses Discord's slash commands for a seamless user experience.

Command Description
`/ping` Replies with pong! to check the bot's latency.
`/status` Checks if the Minecraft server is currently online or offline.
`/info` Provides detailed information about the server, including its software, address, and port.
`/players` Lists the names of all players currently in the server.

## Installation and Setup 🛠️

To get a local copy of the project up and running, follow these simple steps.
---
> ### Prerequisites
    >   * Node.js: Make sure you have Node.js installed on your system.
    >   * pnpm: The pnpm package manager is required to install dependencies.
    
> [!TIP]
  > Use npm instead of pnpm if you have issues with pnpm

---

### Steps

---

#### 1. Clone Repository:

```
git clone https://github.com/daniaru6340/MC-Server-Bot.git
cd MC-Server-Bot
```

---

#### 2. Install the required dependencies:
```
pnpm install
```

---

#### 3. Create a .env file:
Create a new file named `.env` in the root directory of the project. This file will store your bot's secret tocken, client ID and api url from [mcstatus.io](https://mcstatus.io/docs);

---

#### 4. Run the bot:
```
pnpm start
```

---

## Contributing 🤝

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1. Fork the Project
2. Create your Feature Branch (`  git checkout -b feature/AmazingFeature  `)
3. Commit your Changes (`  git commit -m 'Add some AmazingFeature  `)
4. Push to the Branch (`  git push origin feature/AmazingFeature  `)
5. Open a Pull Request


## Special Thanks to

* ### mcstatus.io

    A special thanks to **[mcstatus.io](https://mcstatus.io/docs)** for providing a free and reliable API that powers this bot. Their service allows developers to easily retrieve real-time Minecraft server status without the need for complex server-side logic or protocol implementations. This project wouldn't be possible without their generous support.

### Contributors

---

![Image](https://contrib.rocks/image?repo=daniaru6340/MC-Server-Bot)