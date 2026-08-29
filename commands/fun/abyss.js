const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("abyss")
        .setDescription("Drags a user to the hadal abyss zone (this will @mention them)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to drag")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const user = interaction.options.getMentionable('user');
        await interaction.reply(`${user} has been dragged into the hadal abyss zone!`);
    }
};