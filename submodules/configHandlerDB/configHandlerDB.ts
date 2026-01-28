import { prisma } from "../../lib/prisma";

(BigInt.prototype as any).toJSON = function () {
return this.toString();
};



    async function addServerConfig(
      guildId: bigint,
      requiredRole: bigint,
      apiUrl: string,
      imageUrl: string,
    ) {
      const serverInfo = await prisma.mcServerInfo.upsert({
        where: {
          guild_id: guildId,
        },
        update: {
          required_role: requiredRole,
          image_url: imageUrl,
          api_url: apiUrl,
        },
        create: {
          guild_id: guildId,
          required_role: requiredRole,
          image_url: imageUrl,
          api_url: apiUrl,
        },
      });

      return serverInfo;
    }


    async function getConfig(guildId:bigint) {
        const config = await prisma.mcServerInfo.findUnique({
            where: {
                guild_id: guildId,
            }
        })
        return config;
    }

    export { addServerConfig, getConfig}