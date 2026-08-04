const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sacrifice")
        .setDescription("Sacrifice a user to the inabakumori gods (this will @mention them)")
        .addMentionableOption(option =>
            option.setName("user")
                .setDescription("The user to sacrifice")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('green')
                .setDescription('Sacrifice to the greenabakumori gods?')
                
    )
    ,
    async execute(interaction) {
        const user = interaction.options.getMentionable('user');
        const green = interaction.options.getBoolean('green');
        if (green) {
            await interaction.reply(`sacrificed ${user} to the greenabakumori gods`);
        } else {
            await interaction.reply(`sacrificed ${user} to the inabakumori gods`);
        }
    }
};