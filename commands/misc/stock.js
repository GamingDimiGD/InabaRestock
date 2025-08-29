const { SlashCommandBuilder } = require("discord.js");
const { getItems, url } = require("../../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stock")
        .setDescription("Check the stock of items"),
    async execute(interaction) {
        let message = await interaction.reply("Checking the stock of items...");
        const items = await getItems(url);
        await message.edit(`# ${items.filter(i => !i.soldOut).length}/${items.length} IN STOCK\n${items.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}`);
    },
};