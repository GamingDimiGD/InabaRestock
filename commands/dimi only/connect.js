const { SlashCommandBuilder, MessageFlags } = require('discord.js'), {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('join vc'),

    async execute(interaction) {
        await interaction.deferReply();
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.editReply({ content: "join vc first", flags: MessageFlags.Ephemeral });
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        connection.on('stateChange', async (oldState, newState) => {
            if (oldState.status === newState.status) return;
            console.log(
                `[VOICE] ${oldState.status} -> ${newState.status}`
            );
            await interaction.editReply({ content: '```' + newState.status + '```', flags: MessageFlags.Ephemeral });
        });

        try {
            await entersState(
                connection,
                VoiceConnectionStatus.Ready,
                3e4
            );

            await interaction.editReply({ content: 'joined', flags: MessageFlags.Ephemeral });
        } catch (error) {
            connection.destroy();
            console.error(error);

            await interaction.editReply({ content: '```' + error.message + '```', flags: MessageFlags.Ephemeral });
        }
    }
};