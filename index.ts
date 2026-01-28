import {
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
  type Interaction,
  type SlashCommandRoleOption,
  type SlashCommandStringOption,
} from "discord.js";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { getinfo } from "./submodules/mcstatus/mcstatus";
import {
  getConfig,
  addServerConfig,
} from "./submodules/configHandlerDB/configHandlerDB";

dotenv.config();

// BigInt support to turn string to BigInt since discord.js gives a string
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Environment Config

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`ENV ${name} is missing!, check the .env file`);
  }
  return value;
}

const TOKEN = getEnv("TOKEN");
const CLIENT_ID = getEnv("CLIENT_ID");
const botIcon = getEnv("ICON");

// client creation
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// command definitions

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
    .addRoleOption((option: SlashCommandRoleOption) =>
      option
        .setName("role")
        .setDescription(
          "The role in which you want to allow high level commands.",
        )
        .setRequired(true),
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("api-url")
        .setDescription("The API url from mcstatus.io for mc server.")
        .setRequired(true),
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("image-url")
        .setDescription("static icon image url of your server")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild),
];

// command registration

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

// handle interactions with bot

client.on(Events.ClientReady, (readyClient: Client<true>) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) {
    if (interaction.isAutocomplete()) {
      return;
    }
    return;
  }

  if (!interaction.guild) {
    return interaction.reply("This command can only be used in a server!");
  }

  if (!interaction.isChatInputCommand()) return;

// defer all interaction replies ephemerally by default

  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  // get the server config from the db

  const config = await getConfig(BigInt(interaction.guild?.id));

  switch (interaction.commandName) {
    case "configure": {
      const role = interaction.options.getRole("role");

      if (!role) {
        return interaction.editReply(`Could not find role:${role}`);
      }

      const apiUrl = interaction.options.getString("api-url");
      const imageUrl = interaction.options.getString("image-url");
      const guildId = interaction.guild?.id;

      if (!apiUrl) {
        return interaction.editReply(
          "Please enter an Api Url from mcstatus.io",
        );
      }

      if (!imageUrl) {
        return interaction.editReply(
          "Please enter a Image Url for your server",
        );
      }

      try {
        // add configuration to the database
       await addServerConfig(BigInt(guildId), BigInt(role.id), apiUrl, imageUrl);

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

      // check if bot is configured in the discord server
      if (config == null) {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.editReply({
            content:
              "Bot has yet not been configured. please configure the bot",
          });
        } else {
          await interaction.editReply({
            content:
              "Bot has yet not been configured. please configure the bot",
          });
        }

        break;
      }

      let api = config.api_url;
      let icon = config.image_url;
      let requiredRole = config.required_role;

      // check status of mcserver
      if (interaction.commandName === "status") {
        let mcInfo = await getinfo(api);
        let online = mcInfo.online;

        if (online === true) {
          const onlineStatusEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle(`${mcInfo.host}`)
            .setDescription(`${mcInfo.motd.clean}`)
            .setThumbnail(icon)
            .addFields({
              name: "Status",
              value: "Server is Online",
            })
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          if (interaction.channel?.isSendable()) {
            await interaction.deleteReply();
            await interaction.channel.send({ embeds: [onlineStatusEmbed] });
          }
        } else if (online === false) {
          const offlineStatusEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`${mcInfo.host}`)
            .setDescription("Sorry For The Inconvinience")
            .setThumbnail(icon)
            .addFields({
              name: "Status",
              value: "Server is Offline",
            })
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          if (interaction.channel?.isSendable()) {
            await interaction.deleteReply();
            await interaction.channel.send({ embeds: [offlineStatusEmbed] });
          }
        }
      }

      // get more detailed info about the server
      if (interaction.commandName === "info") {
        let mcInfo = await getinfo(api);
        let online = mcInfo.online;

        if (online) {
          const infoEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle(`${mcInfo.motd.clean}`)
            .setDescription(
              "Go enjoy the server guys",
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

          if (interaction.channel?.isSendable()) {
            await interaction.deleteReply();
            await interaction.channel.send({ embeds: [infoEmbed] });
          }
        } else {
          const offlineEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("MC-Server-Bot :(")
            .setDescription(
              `I apologize for the inconvenience caused. <@&${config.required_role}> please look into this`,
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

          if (interaction.channel?.isSendable()) {
            await interaction.deleteReply();
            await interaction.channel.send({ embeds: [offlineEmbed] });
          }
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
                .setTitle(`${mcInfo.host}`)
                .setDescription(`${mcInfo.motd.clean}`)
                .setThumbnail(icon)
                .addFields({
                  name: "Players",
                  value: playersList,
                })
                .setTimestamp()
                .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

              if (interaction.channel?.isSendable()) {
                await interaction.deleteReply();
                await interaction.channel.send({ embeds: [playerListEmbed] });
              }
            }
          }
        } else {
          const noPlayersEmbed = new EmbedBuilder()
            .setColor("#808080")
            .setTitle(`${mcInfo.host}`)
            .setDescription("Sorry No One is Playing at The Momment")
            .setThumbnail(icon)
            .setTimestamp()
            .setFooter({ text: "MC-Server-Bot", iconURL: botIcon });

          if (interaction.channel?.isSendable()) {
            await interaction.deleteReply();
            await interaction.channel.send({ embeds: [noPlayersEmbed] });
          }
        }
      }

      // list uuid's of players currently playing on the server and restricted to users having a certain role
      if (interaction.commandName === "uuid") {


        let mcInfo = await getinfo(api);
        let online = mcInfo.online;

        if (!interaction.inCachedGuild()) {
          return interaction.editReply(
            "This command can only be used in a server",
          );
        }

        if (
          interaction.member != null &&
          interaction.member.roles.cache.some(
            (role) => BigInt(role.id) === requiredRole,
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
                  .setTitle(`${mcInfo.host}`)
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
                });
              }
            }
          } else {
            const noPlayersEmbed = new EmbedBuilder()
              .setColor("#808080")
              .setTitle(`${mcInfo.host}`)
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
          });
        }
      }

      // Lists all the commands the bot can handle plus gives personalized response based on if the user has a specific role
      if (interaction.commandName === "help") {
        if (!interaction.inCachedGuild()) {
          return interaction.editReply(
            "This command can only be used in a server",
          );
        }

        if (
          interaction.member.roles.cache.some(
            (role) => BigInt(role.id) === requiredRole,
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

client.login(TOKEN);
