const { Events, REST, Routes } = require('discord.js');
const { getItems, commands, checkDuration, dimiOnlyCommands } = require("../index.js");
const fs = require('fs'), path = require('path');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`[Discord] Ready! Logged in as ${client.user.tag}`);
        const channel = client.channels.cache.get('1410960597209845791');
        const check = async () => {
            const file = path.join(__dirname, "../cache/checkData.json")
            const { allItemsCache } = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : { allItemsCache: [], lastCheck: 0 };
            let items = await getItems();
            if (!items.length) return channel.send('# NO ITEMS FOUND');
            channel.send(`# ${items.filter(i => !i.soldOut).length}/${items.length} IN STOCK\n${items.map(i => `${i.name} ${i.soldOut ? "❌" : "✅"}`).join("\n")}`)
                .then(msg => msg.crosspost())
                .catch(err => console.log(err));
            if (items.filter(i => !i.soldOut).length !== allItemsCache.filter(i => !i.soldOut).length)
                channel.send("# <@&1438187277380751370> UPDATE DETECTED")
                    .then(msg => msg.crosspost())
                    .catch(err => console.log(err));
        }
        check()
        setInterval(check, checkDuration);

        const { deadChatChannelID, deadChatInterval } = require('../config.json');
        const deadChatChannel = client.channels.cache.get(deadChatChannelID);
        let checkDeadChat = () => {
            let lastMessage = deadChatChannel.lastMessage;
            if ((!lastMessage || (Date.now() - lastMessage.createdTimestamp) >= 36e5) && deadChatChannel.lastMessage.author.id !== client.user.id) {
                deadChatChannel.send('<@&1453707542113816586> dead chat alert').catch(err => console.log(err));
            }
            console.log(`[Discord] Dead chat check executed.`);
            return setTimeout(checkDeadChat, parseInt(deadChatInterval));
        };
        checkDeadChat()

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
        try {
            console.log('[Discord] Started refreshing global application (/) commands.');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );

            console.log('[Discord] Successfully reloaded global (/) commands.');
        } catch (error) {
            console.error(error);
        }

        client.user.setPresence({ activities: [{ name: 'Inabakumori\'s booth', type: 'WATCHING' }], status: 'online' });
    },
};