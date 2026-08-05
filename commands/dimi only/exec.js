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
        await interaction.deferReply();
        exec(code, async (error, stdout, stderr) => {
            if (error) {
                await interaction.editReply(`Error: \`\`\`${error.message}\`\`\``);
                return;
            }
            console.log(`[std] ${stdout || stderr}`);
            await interaction.editReply(`\`\`\`${(stdout || stderr).toString().slice(0, 1000)}\`\`\``);
        });
    }
};