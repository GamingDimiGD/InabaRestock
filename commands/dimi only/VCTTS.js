const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource
} = require('@discordjs/voice'),
    googleTTS = require('google-tts-api'),
    { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vc-tts')
        .setDescription('Text to Speech')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to convert to speech')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('lang')
                .setDescription('The language to use')
        ),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        })
        const player = createAudioPlayer();
        const resource = createAudioResource(googleTTS.getAudioUrl(interaction.options.getString('text'), {
            lang: interaction.options.getString('lang') || 'en',
            slow: false,
            host: 'https://translate.google.com'
        }));
        player.play(resource);
        connection.subscribe(player);
        await interaction.reply({ content: 'speaking rn', flags: MessageFlags.Ephemeral });
    }
}