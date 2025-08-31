const { Events, REST, Routes } = require('discord.js');
const { getItems, commands, checkDuration, dimiOnlyCommands } = require("../index.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`[Discord] Ready! Logged in as ${client.user.tag}`);
        const channel = client.guilds.cache.get('1410959974842236930').channels.cache.get('1410960597209845791');
        setInterval(async () => {
            let items = await getItems();
            if (!items) return channel.send('# NO ITEMS FOUND');
            channel.send(`# ${items.filter(i => !i.soldOut).length}/${items.length} IN STOCK\n${items.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}`);
            if (items.filter(i => !i.soldOut).length !== 0) channel.send("# MIRACLE MIRACLE! @everyone INABAKUMORI RESTOCKED!!!");
        }, checkDuration);


        const rest = new REST().setToken(process.env.TOKEN);
        try {
            console.log(`[Discord] Started refreshing ${commands.length} application (/) commands.`);
            for (const [guildId, guild] of client.guilds.cache) {
                try {
                    const data = await rest.put(
                        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                        { body: guildId === '1410959974842236930' ? dimiOnlyCommands.concat(commands) : commands },
                    );
                    console.log(`[Discord] Registered ${data.length} application (/) commands for server ${guild.name}`);
                } catch (err) {
                    console.error(`[Discord] Failed to register application (/) commands for server ${guild.name}:`, err);
                }
            }

            console.log(`[Discord] Successfully reloaded application (/) commands through ${client.guilds.cache.size} servers.`);
        } catch (error) {
            console.error(error);
        }
        client.user.setPresence({ activities: [{ name: 'Inabakumori\'s booth', type: 'WATCHING' }], status: 'online' });
    },
};