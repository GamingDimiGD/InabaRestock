const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lag")
        .setDescription("train")
    ,
    async execute(interaction) {
        let ms = Date.now();
        await interaction.deferReply().catch(() => {});
        ms = Date.now() - ms;
        return await interaction.editReply('Train. ' + ms + 'ms');
    }
};