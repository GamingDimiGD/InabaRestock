const { SlashCommandBuilder } = require("discord.js");
const { reply } = require("../../ai/gainSentience.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sentence")
        .setDescription("Generate a sentence without prompt")
    ,
    async execute(interaction) {
        await interaction.deferReply();
        let replyMessage = await reply('', false).response;
        await interaction.editReply(replyMessage.replaceAll(/<@[0-9]+>|<@&[0-9]+>/g, "[mention blocked]") || "i am merl and i dont know anything");
    }
};