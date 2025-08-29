const { Events } = require('discord.js');
const { getItems, url } = require("../index.js");

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        const channel = client.guilds.cache.get('1410959974842236930').channels.cache.get('1410960597209845791');
        let items = await getItems(url);
        channel.send(`# ${items.filter(i => !i.soldOut).length}/${items.length} IN STOCK\n${items.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}`);
        setInterval(async () => {
            let items = await getItems(url);
            channel.send(`# ${items.filter(i => !i.soldOut).length}/${items.length} IN STOCK\n${items.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}`);
            if (items.filter(i => !i.soldOut).length !== 0) channel.send("# MIRACLE MIRACLE! @everyone INABAKUMORI RESTOCKED!!!");
        }, 60000);
	},
};