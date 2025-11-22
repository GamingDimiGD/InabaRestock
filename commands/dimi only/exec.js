const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("exec")
        .setDescription("Execute code in the terminal")
        .addStringOption(option =>
            option.setName("code")
                .setDescription("The code to execute")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const code = interaction.options.getString("code");
        const { exec } = require("child_process");
        exec(code, async (error, stdout, stderr) => {
            if (error) {
                await interaction.reply(`Error: \`\`\`${error.message}\`\`\``);
                return;
            }
            await interaction.reply(`\`\`\`${stdout || stderr}\`\`\``);
        });
    }
};