const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reply")
        .setDescription("remotely reply to a message")
        .addStringOption(option =>
            option.setName("input")
                .setDescription("The reply")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('message_id')
                .setDescription('The ID of the message to reply to')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel where the message is sent")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        const messageID = interaction.options.getString("message_id"), channelID = interaction.options.getChannel("channel")?.id || interaction.channel.id;
        try {
            if (!messageID) return await interaction.reply({ content: 'No message ID provided', flags: MessageFlags.Ephemeral });
            const message = await interaction.client.channels.cache.get(channelID).messages.fetch(messageID);
            if (!message) return await interaction.reply({ content: 'Message not found', flags: MessageFlags.Ephemeral });
            await message.reply(interaction.options.getString("input"));
            await interaction.reply({ content: 'sent', flags: MessageFlags.Ephemeral });
        } catch (error) {
            await interaction.reply({ content: `Error: \`\`\`${error.message}\`\`\``, flags: MessageFlags.Ephemeral });
        }
    },
};