const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { getinfo } = require("./submodules/mcstatus/mcstatus");
const { loadConfig } = require("./submodules/configHandler/configHandler");

dotenv.config();

// dotenv variables

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const botIcon = process.env.ICON;

// client creation
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// command registration
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong! if online.")
    .setContexts(InteractionContextType.Guild),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Checks if server is online or not.")
    .setContexts(InteractionContextType.Guild),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Tells about the minecraft server.")
    .setContexts(InteractionContextType.Guild),

  new SlashCommandBuilder()
    .setName("players")
    .setDescription("List out all the players currently playing.")
    .setContexts(InteractionContextType.Guild),

  new SlashCommandBuilder()
    .setName("uuid")
    .setDescription("List UUID's of the players online.")
    .setContexts(InteractionContextType.Guild),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all the commands")
    .setContexts(InteractionContextType.Guild),

  new SlashCommandBuilder()
    .setName("configure")
    .setDescription("Setup the bot on the server.")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription(
          "The role in which you want to allow high level commands.",
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("api-url")
        .setDescription("The API url from mcstatus.io for mc server.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("image-url")
        .setDescription("static icon image url of your server")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild),
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
  if (!interaction.guild) {
    return interaction.reply("This command can only be used in a server!");
<<<<<<< HEAD
  }
=======
<<<<<<< HEAD
}

  const config = await loadConfig(interaction.guild?.id);
  
=======
  }
>>>>>>> 2125ae0 (bug fixes fix hanging issue for discord reply)
>>>>>>> 0c641103c449d1a7d63ac60826067bdfd0a16536

  if (!interaction.isChatInputCommand()) return;

  const privateCommands = ["configure", "uuid", "ping", "help"];
  const isPrivate = privateCommands.includes(interaction.commandName);

  await interaction.deferReply({ flags: isPrivate ? MessageFlags.Ephemeral : 0 });

  const config = await loadConfig(interaction.guild?.id);

  switch (interaction.commandName) {
    case "configure": {
      const role = interaction.options.getRole("role");
      const apiUrl = interaction.options.getString("api-url");
      const imageUrl = interaction.options.getString("image-url");
      const guildId = interaction.guild?.id;
      const configPath = path.join(__dirname, "configs", "guildConfig.json");

      try {
        const configData = fs.readFileSync(configPath, "utf8");
        let config = JSON.parse(configData);

        if (!config[guildId]) {
          config[guildId] = {};
        }

        config[guildId].requiredRole = role.id;
        config[guildId].apiUrl = apiUrl;
        config[guildId].imageUrl = imageUrl;

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        interaction.editReply(
          `✅ Required role for the command has been successfully set to: **${role.name}**`,
        );
      } catch (err) {
        console.error("Error updating the config file:", err);
        interaction.editReply(
          `❌ There was an error while trying to save the configurations`,
        );
      }

      break;
    }

    default: {
      // ping the bot
      if (interaction.commandName === "ping") {
        return await interaction.editReply("pong!");
      }

      // check if config contains the guild
<<<<<<< HEAD
      if (config == null) {
=======
<<<<<<< HEAD
      if(config == null ) {
>>>>>>> 0c641103c449d1a7d63ac60826067bdfd0a16536
        if (!interaction.replied && !interaction.deferred) {
          await interaction.editReply({
            flags: MessageFlags.Ephemeral,
            content:
              "Bot has yet not been configured. please configure the bot",
          });
        } else {
          await interaction.editReply({
            flags: MessageFlags.Ephemeral,
            content:
              "Bot has yet not been configured. please configure the bot",
          });
        }

<<<<<<< HEAD
        break;
      }

=======
         } else {
        await interaction.editReply({ 
          flags: MessageFlags.Ephemeral,
          content: "Bot has yet not been configured. please configure the bot"
         })
    }

         break;
=======
      if (config == null) {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.editReply({
            flags: MessageFlags.Ephemeral,
            content:
              "Bot has yet not been configured. please configure the bot",
          });
        } else {
          await interaction.editReply({
            flags: MessageFlags.Ephemeral,
            content:
              "Bot has yet not been configured. please configure the bot",
          });
        }

        break;
>>>>>>> 2125ae0 (bug fixes fix hanging issue for discord reply)
      }

>>>>>>> 0c641103c449d1a7d63ac60826067bdfd0a16536
      // get required data from config file

      let api = config.apiUrl;
      let icon = config.imageUrl;
      let requiredRole = config.requiredRole;

      // check status of mcserver
      if (interaction.commandName === "status") {

        let mcInfo = await getinfo(api);
        let online = mcInfo.online;

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
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

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
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          await interaction.editReply({ embeds: [offlineStatusEmbed] });
        }
      }

      // get more detailed info about the server
      if (interaction.commandName === "info") {

        let mcInfo = await getinfo(api);
        let online = mcInfo.online;

        if (online) {
          const infoEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("Coming In Hot!")
            .setDescription(
              "Java users dont have to worry about writing a port",
            )
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
              },
            )
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          await interaction.editReply({ embeds: [infoEmbed] });
        } else {
          const offlineEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Coming In Hot!")
            .setDescription(
              "Java users dont have to worry about writing a port",
            )
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
              },
            )
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          await interaction.editReply({ embeds: [offlineEmbed] });
        }
      }

      // list all the players currently on the server
      if (interaction.commandName === "players") {

        let mcInfo = await getinfo(api);
        let online = mcInfo.online;

        if (online && mcInfo.players.list.length != 0) {
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
                .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

              await interaction.editReply({ embeds: [playerListEmbed] });
            }
          }
        } else {
          const noPlayersEmbed = new EmbedBuilder()
            .setColor("#808080")
            .setTitle("Coming In Hot!")
            .setDescription("Sorry No One is Playing at The Momment")
            .setThumbnail(icon)
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          await interaction.editReply({ embeds: [noPlayersEmbed] });
        }
      }

      // list uuid's of players currently playing on the server for users having a certain role
      if (interaction.commandName === "uuid") {

        let mcInfo = await getinfo(api);
        let online = mcInfo.online;

        if (
          interaction.member != null &&
          interaction.member.roles.cache.some(
            (role) => role.id === requiredRole,
          )
        ) {
          if (online && mcInfo.players.list.length != 0) {
            let players = [];

            for (let i = 0; i < mcInfo.players.list.length; i++) {
              const player = mcInfo.players.list[i].name_raw;
              players.push(
                `${i + 1}.${player}: \`\`\`${mcInfo.players.list[i].uuid}\`\`\``,
              );

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
                    inline: true,
                  })
                  .setTimestamp()
                  .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

                await interaction.editReply({
                  embeds: [playerListEmbed],
                  flags: MessageFlags.Ephemeral,
                });
              }
            }
          } else {
            const noPlayersEmbed = new EmbedBuilder()
              .setColor("#808080")
              .setTitle("Coming In Hot!")
              .setDescription("Sorry No One is Playing at The Momment")
              .setThumbnail(icon)
              .setTimestamp()
              .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

            await interaction.editReply({ embeds: [noPlayersEmbed] });
          }
        } else if (interaction.member == null) {
          console.log("has not joined a guid");
        } else {
          await interaction.editReply({
            content: `U Do Not Have Access To This Command`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      //Lists all the commands the bot can handle
      if (interaction.commandName === "help") {
<<<<<<< HEAD
=======

>>>>>>> 0c641103c449d1a7d63ac60826067bdfd0a16536
        if (
          interaction.member.roles.cache.some(
            (role) => role.id === requiredRole,
          )
        ) {
          const helpEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("MC-Server-bot")
            .setDescription("Here is my Commad List")
            .setThumbnail(icon)
            .addFields(
              {
                name: "`/ping`",
                value: "Replies with pong! to check the bot's latency.",
              },
              {
                name: "`/status`",
                value:
                  "Checks the status of minecraft and replies accordingly.",
              },
              {
                name: "`/info`",
                value:
                  "Gives detailes information about the server. informations include server software, status, address, port and number of current players",
              },
              {
                name: "`/players`",
                value:
                  "Lists out all the players currently playing on the server",
              },
              {
                name: "`/uuid`",
                value:
                  "Lists out UUID's of players currently playing on the server",
              },
              {
                name: "`/help`",
                value: "Tells you about all the awsome things i can do",
              },
            )
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          await interaction.editReply({ embeds: [helpEmbed] });
        } else {
          const helpEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("MC-Server-bot")
            .setDescription("Here is my Commad List")
            .setThumbnail(icon)
            .addFields(
              {
                name: "`/ping`",
                value: "Allows admins to configure the bot.",
              },
              {
                name: "`/ping`",
                value: "Replies with pong! to check the bot's latency.",
              },
              {
                name: "`/status`",
                value:
                  "Checks the status of minecraft and replies accordingly.",
              },
              {
                name: "`/info`",
                value:
                  "Gives detailes information about the server. informations include server software, status, address, port and number of current players",
              },
              {
                name: "`/players`",
                value:
                  "Lists out all the players currently playing on the server",
              },
              {
                name: "`/help`",
                value: "Tells you about all the awsome things i can do",
              },
            )
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          await interaction.editReply({ embeds: [helpEmbed] });
        }
      }

      break;
    }
  }
});

<<<<<<< HEAD
=======
<<<<<<< HEAD


=======
>>>>>>> 2125ae0 (bug fixes fix hanging issue for discord reply)
>>>>>>> 0c641103c449d1a7d63ac60826067bdfd0a16536
client.login(TOKEN);
