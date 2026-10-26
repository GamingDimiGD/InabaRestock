const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-reaction")
        .setDescription("Add a reaction to a message")
        .addStringOption(option =>
            option.setName("message_id")
                .setDescription("The message ID to add a reaction to")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("emoji")
                .setDescription("The emoji to add")
                .setRequired(true)
                .setAutocomplete(true)
        )
    ,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused(), emojis = [...interaction.client.emojis.cache].filter(([_,emoji]) => emoji.toString().includes(focusedValue)).slice(0, 25).map(([_,emoji]) => ({ name: emoji.name, value: emoji.id }));
        await interaction.respond(emojis);
    },
    async execute(interaction) {
        const message = await interaction.channel.messages.fetch(interaction.options.getString("message_id"));
        await message.react(interaction.options.getString("emoji"));
        await interaction.reply({ content: 'sent', flags: MessageFlags.Ephemeral });
    }
};