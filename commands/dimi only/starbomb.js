const { SlashCommandBuilder } = require("discord.js");
const stars = ["1571350588246069429", "1571350586224549929", "1571350584341168128", "1571350582759792730", "1571350581128331386", "1571350579689562182", "1571350578007769128", "1571350575897907261", "1571350574643945672", "1571350572815228988", "1571350571338956841", "1571350569560309862", "1571350567849037905", "1571350566150471680", "1571350563973632092", "1571350562232864889", "1571350560571916348", "1571350559104041010", "1571350557258551377", "1571350554800820284"]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("starbomb")
        .setDescription("starbomb")
        .addStringOption(option =>
            option.setName("message_id")
                .setDescription("The message to starbomb")
                .setRequired(true)
    ),
    async execute(interaction) {
        const messageId = interaction.options.getString("message_id");
        const message = await interaction.channel.messages.fetch(messageId).catch(() => null);
        stars.forEach(async (star) => {
            await message.react(star).catch(() => null);
        });
        return await interaction.reply({ content: 'sent', flags: MessageFlags.Ephemeral });
    }
}