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
        .addBooleanOption(option =>
            option.setName("learn")
                .setDescription("Whether the answer should be added to the AI's knowledge base")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        const question = interaction.options.getString("question");
        const learn = interaction.options.getBoolean("learn") || false;
        await interaction.deferReply();
        let replyMessage = await reply(question, learn).response;
        if (!replyMessage) console.error(`[AI] Failed to get a reply for the question: ${question}`);
        replyMessage = `Q. ${question} \nA. ${replyMessage}`
        console.log(`[AI] ${replyMessage}`);
        await interaction.editReply(replyMessage || "i am merl and i dont know anything");
    }
};