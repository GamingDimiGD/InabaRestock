const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("exit")
        .setDescription("Exit the bot")
    ,
    async execute(interaction) {
        await interaction.reply("say goodbyeeeeeeeeeeeeeeeeeee (i will be back maybe)");
        process.exit(0);
    }
}