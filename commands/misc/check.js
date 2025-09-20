const { SlashCommandBuilder } = require("discord.js");
const { allItemsCache, lastCheck } = require("../../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("check")
        .setDescription("Check current stock of inabakumori")
    ,
    async execute(interaction) {
        if (!allItemsCache.length) return await interaction.reply("# NO ITEMS FOUND\nreason: either cache is empty or booth.pm is down");
        await interaction.reply(`# ${allItemsCache.filter(i => !i.soldOut).length}/${allItemsCache.length} IN STOCK\n${allItemsCache.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}\nLast checked at <t:${lastCheck}:R>`);
    },
};