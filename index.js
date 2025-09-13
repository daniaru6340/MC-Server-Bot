const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  EmbedBuilder,
} = require("discord.js");
const dotenv = require("dotenv");
const { getinfo } = require("./submodules/mcstatus/mcstatus");

dotenv.config();

// dotenv variables

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// client creation
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// hello there rai

// command registration
const commands = [
  {
    name: "ping",
    description: "Replies with !pong if online",
  },

  {
    name: "status",
    description: "Checks if server is online or not",
  },

  {
    name: "info",
    description: "Tells about the minecraft server",
  },

  {
    name: "players",
    description: "List out all the players currently playing",
  },
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands");

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (err) {
    console.error(err);
  }
})();

// bot actions

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply();

  if (interaction.commandName === "ping") {
    await interaction.editReply("pong!");
  }

  if (interaction.commandName === "status") {
    let icon = "https://generous-whale.static.domains/comingInHot.png";
    let mcInfo = await getinfo();
    let online = mcInfo.online;

    console.log(online);

    if (online === true) {
      const onlineStatusEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Coming In Hot!")
        .setDescription(`${mcInfo.motd.clean}`)
        .setThumbnail(icon)
        .addFields({
          name: "Status",
          value: "Server is Online",
        })
        .setTimestamp()
        .setFooter({ text: "MC-Server-Bot", iconURL: icon });

      await interaction.editReply({ embeds: [onlineStatusEmbed] });
    } else if (online === false) {
      const offlineStatusEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Coming In Hot!")
        .setDescription("Sorry For The Inconvinience")
        .setThumbnail(icon)
        .addFields({
          name: "Status",
          value: "Server is Offline",
        })
        .setTimestamp()
        .setFooter({ text: "MC-Server-Bot", iconURL: icon });

      await interaction.editReply({ embeds: [offlineStatusEmbed] });
    }
  }

  if (interaction.commandName === "info") {
    let icon = "https://generous-whale.static.domains/comingInHot.png";
    let mcInfo = await getinfo();
    let online = mcInfo.online;

    if (online) {
      const infoEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Coming In Hot!")
        .setDescription("Java users dont have to worry about writing a port")
        .setThumbnail(icon)
        .addFields(
          {
            name: "Status",
            value: "Online",
            inline: true,
          },
          {
            name: "Software",
            value: `${mcInfo.version.name_clean}`,
            inline: true,
          },
          {
            name: "Players",
            value: `${mcInfo.players.online}/${mcInfo.players.max}`,
            inline: true,
          },
          {
            name: "Server Address",
            value: `\`\`\`${mcInfo.host}\`\`\``,
            inline: true,
          },
          {
            name: "Port",
            value: `\`\`\`${mcInfo.port}\`\`\``,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: "MC-Server-Bot", iconURL: icon });

      await interaction.editReply({ embeds: [infoEmbed] });
    } else {
      const offlineEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Coming In Hot!")
        .setDescription("Java users dont have to worry about writing a port")
        .setThumbnail(icon)
        .addFields(
          {
            name: "Status",
            value: "Offline",
            inline: true,
          },
          {
            name: "Software",
            value: ` Unknown `,
            inline: true,
          },
          {
            name: "Players",
            value: `0`,
            inline: true,
          },
          {
            name: "Server Address",
            value: `\`\`\`${mcInfo.host}\`\`\``,
            inline: true,
          },
          {
            name: "Port",
            value: `\`\`\`${mcInfo.port}\`\`\``,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: "MC-Server-Bot", iconURL: icon });

      await interaction.editReply({ embeds: [offlineEmbed] });
    }
  }

  if (interaction.commandName === "players") {
    let icon = "https://generous-whale.static.domains/comingInHot.png";
    let mcInfo = await getinfo();
    let online = mcInfo.online;

    if (online) {
      let players = [];

      for (let i = 0; i < mcInfo.players.list.length; i++) {
        const player = mcInfo.players.list[i].name_raw;
        players.push(`${i + 1}.${player}`);

        if (i + 1 == mcInfo.players.list.length) {
          let playersList = players.join("\n");

          const playerListEmbed = new EmbedBuilder()
            .setColor("#0000FF")
            .setTitle("Coming In Hot!")
            .setDescription(`${mcInfo.motd.clean}`)
            .setThumbnail(icon)
            .addFields({
              name: "Players",
              value: playersList,
            })
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: icon });

          await interaction.editReply({ embeds: [playerListEmbed] });
        }
      }
    }
  }
});
client.login(TOKEN);
