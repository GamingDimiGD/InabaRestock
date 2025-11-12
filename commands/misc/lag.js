const { SlashCommandBuilder } = require("discord.js");
const { client } = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lag")
        .setDescription("train")
    ,
    async execute(interaction) {
        let ms = Date.now();
        let message = await interaction.reply(`Train...`);
        ms = Date.now() - ms;
        await message.edit('Train. ' + ms + 'ms');
    }
};