const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("solve-quadratic")
        .setDescription("Does your math homework, a, b, c as in ax^2 + bx + c = 0")
        .addIntegerOption(option =>
            option.setName("a")
                .setDescription("The first number")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("b")
                .setDescription("The second number")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("c")
                .setDescription("The third number")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const a = interaction.options.getInteger("a"), b = interaction.options.getInteger("b"), c = interaction.options.getInteger("c");
        await interaction.reply(`${a}x² + ${b}x + ${c} = 0, x = ${(-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)}, ${(-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)}`);
    }
};