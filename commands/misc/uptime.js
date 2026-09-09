const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("check bot uptime")
    ,
    async execute(interaction) {
        return interaction.reply(`server is up since <t:${Math.floor(( Date.now() - Math.floor(performance.now()) ) / 1e3)}:R> and client has been up since <t:${Math.floor(( Date.now() - Math.floor(interaction.client.uptime) ) / 1e3)}:R>`);
    }
};