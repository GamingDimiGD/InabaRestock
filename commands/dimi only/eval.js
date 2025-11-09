const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Evaluate code")
        .addStringOption(option =>
            option.setName("code")
                .setDescription("The code to evaluate")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const code = interaction.options.getString("code");
        let returns;
        try {
            returns = eval(code);
        } catch (error) {
            returns = error;
        }
        interaction.reply(`input: \`\`\`${code}\`\`\`\noutput: \`\`\`js\n${returns}\n\`\`\``);
    }
};