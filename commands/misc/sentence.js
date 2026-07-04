const { SlashCommandBuilder } = require("@discordjs/builders");
const { reply } = require("../../ai/gainSentience.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sentence")
        .setDescription("Generate a sentence without prompt")
    ,
    async execute(interaction) {
        await interaction.deferReply();
        let replyMessage = await reply(String.fromCharCode(Math.floor(Math.random() * 26) + 97), false).response;
        console.log(`[AI] ${replyMessage}`);
        await interaction.editReply(replyMessage || "i am merl and i dont know anything");
    }
};