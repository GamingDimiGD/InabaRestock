const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Replies with your input!")
        .addStringOption(option =>
            option.setName("input")
                .setDescription("The input to echo back")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the message to")
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to send the message to")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        const userID = interaction.options.getUser("user")?.id, channelID = interaction.options.getChannel("channel")?.id;
        if (!channelID && !userID) return await interaction.reply(interaction.options.getString("input"));
        if (channelID) try {
            await interaction.client.channels.cache.get(channelID).send(interaction.options.getString("input"));
            await interaction.reply({ content: 'sent', flags: MessageFlags.Ephemeral })
        } catch (error) {
            interaction.reply(`Error: ${error.message}`)
        }
        if (userID) try {
            const user = await interaction.client.users.fetch(userID);
            user.send(interaction.options.getString("input"));
            await interaction.reply({ content: 'sent', flags: MessageFlags.Ephemeral })
        } catch (error) {
            interaction.reply(`Error: ${error.message}`)
        }
    },
};