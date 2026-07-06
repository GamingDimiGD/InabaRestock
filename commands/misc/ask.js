const { SlashCommandBuilder } = require("@discordjs/builders");
const { reply } = require("../../ai/gainSentience.js");

const trustedUsers = ['766856785444864010', '1331943032500518976']

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
                .setDescription("Whether the answer should be added to the AI's knowledge base (only trusted users can enable this)")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        const question = interaction.options.getString("question");
        let learn = interaction.options.getBoolean("learn") || false;
        if (!trustedUsers.includes(interaction.user.id) && learn) {
            await interaction.channel.send('Warning: Only trusted users can enable learning. The AI will not learn from this interaction.');
            learn = false;
        }
        await interaction.deferReply();
        let replyMessage = await reply(question, learn).response;
        if (!replyMessage) console.error(`[AI] Failed to get a reply for the question: ${question}`);
        replyMessage = `Q. ${question} \nA. ${replyMessage}`;
        console.log(`[AI] ${replyMessage}`);
        await interaction.editReply(replyMessage || "i am merl and i dont know anything");
    }
};