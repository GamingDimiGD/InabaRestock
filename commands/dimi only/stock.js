const { SlashCommandBuilder } = require("discord.js");
const { getItems } = require("../../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stock")
        .setDescription("Check the stock of items (only for dimi)")
        .addStringOption(option =>
            option.setName("subdomain")
                .setDescription("The subdomain of the shop")
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName("pages")
                .setDescription("Maximum number of pages to check")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        let message = await interaction.reply("Checking the stock of items...\n -# This may take a while");
        const items = await getItems(
            interaction.options.getString("subdomain") || "inabakumori",
            Array.from({ length: interaction.options.getNumber("pages") || 2 }, (_, i) => i + 1) || [1, 2]
        );
        if (!items) return await message.edit("# NO ITEMS FOUND");
        await message.edit(`# ${items.filter(i => !i.soldOut).length}/${items.length} IN STOCK\n${items.map(i => `${i.name} ${i.soldOut ? "(SOLD OUT)" : ""}`).join("\n")}`);
    },
};