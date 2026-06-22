const { SlashCommandBuilder } = require("@discordjs/builders");
const { reply } = require("../../ai/gainSentience.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("Ask a question to the pea-brained AI")
        .addStringOption(option =>
            option.setName("question")
                .setDescription("The question to ask")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const question = interaction.options.getString("question");

        let replyMessage = await reply(question, false).response;
        if (!replyMessage) console.error(`[AI] Failed to get a reply for the question: ${question}`);
        replyMessage = `Q. ${question} \nA. ${replyMessage}`
        console.log(`[AI] ${replyMessage}`);
        await interaction.reply(replyMessage || "i am merl and i dont know anything");
    }
};