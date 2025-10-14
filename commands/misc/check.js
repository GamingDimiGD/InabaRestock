const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("check")
        .setDescription("Check current stock of inabakumori")
    ,
    async execute(interaction) {
        const { allItemsCache, lastCheck } = require("../../index.js");
        if (!allItemsCache.length) return await interaction.reply("no items found because either cache is empty or booth.pm is down");
        await interaction.reply(`As of <t:${Math.floor(lastCheck/1000)}:R>, there are ${allItemsCache.filter(i => !i.soldOut).length}/${allItemsCache.length} items that aren't out of stock in inabakumori's booth`);
    },
};