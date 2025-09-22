const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("check")
        .setDescription("Check current stock of inabakumori")
    ,
    async execute(interaction) {
        const { allItemsCache, lastCheck } = require("../../index.js");
        if (!allItemsCache.length) return await interaction.reply("# NO ITEMS FOUND\nreason: either cache is empty or booth.pm is down");
        await interaction.reply(`# ${allItemsCache.filter(i => !i.soldOut).length}/${allItemsCache.length} IN STOCK\n${allItemsCache.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}\nLast updated <t:${Math.floor(lastCheck/1000)}:R>`);
    },
};