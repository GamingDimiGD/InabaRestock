const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dice")
        .setDescription("Rolls a dice")
        .addIntegerOption(option =>
            option.setName("sides")
                .setDescription("The number of sides")
        )
    ,
    async execute(interaction) {
        const sides = interaction.options.getInteger("sides") || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("roll_again")
                .setLabel("Reroll")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            content: `You rolled a ${result} (${sides} sides)`, components: [row]
        });
    }
};