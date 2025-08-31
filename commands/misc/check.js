const { SlashCommandBuilder } = require("discord.js");
const { allItemsCache } = require("../../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("check")
        .setDescription("Check current stock of inabakumori")
    ,
    async execute(interaction) {
        if (!allItemsCache.length) return await interaction.reply("# NO ITEMS FOUND");
        await interaction.reply(`# ${allItemsCache.filter(i => !i.soldOut).length}/${allItemsCache.length} IN STOCK\n${allItemsCache.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}`);
    },
};