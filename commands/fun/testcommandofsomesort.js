const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("foo")
    ,
    async execute(interaction) {
        await interaction.reply("bar");
    }
};