const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    VoiceConnectionStatus,
    AudioPlayerStatus
} = require('@discordjs/voice'),
    { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs'),
    fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args))

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play-music-in-vc')
        .setDescription('Plays music in vc')
        .addNumberOption(option =>
            option.setName('volume')
                .setDescription('The volume to set (0-1)')
        )
    ,
    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        await interaction.reply('joining vc...');
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        await entersState(
            connection,
            VoiceConnectionStatus.Ready,
            3e4
        );
        await interaction.editReply('fetching music...');
        let now = Date.now();
        const path = JSON.parse(fs.readFileSync('./config.json', 'utf-8')).musicPath ||
            'https://gamingdimigd.pages.dev/games/osage_clicker/js/music%20road/music/Hadal%20Abyss%20Zone.mp3';
        const player = createAudioPlayer();
        if (path.startsWith('http')) {
            const response = await fetch(path);
            if (!response.ok) {
                return interaction.editReply('error while fetching music: ```' + response.statusText + '```');
            } else {
                await interaction.editReply('fetched music in ' + (Date.now() - now) + 'ms, downloading now... \n-# this may take a while');
            }
            now = Date.now();
            fs.writeFileSync('./music.mp3', Buffer.from(await response.arrayBuffer()));
            await interaction.editReply('downloaded music in ' + (Date.now() - now) + 'ms');
        }
        const resource = createAudioResource(path.startsWith('http') ? './music.mp3' : path, {
            inlineVolume: true
        });
        resource.volume.setVolume(interaction.options.getNumber('volume') || 0.5);

        player.on('stateChange', (oldState, newState) => {
            console.log(
                `[PLAYER] ${oldState.status} -> ${newState.status}`
            );
        });

        player.on('error', error => {
            console.error('[PLAYER ERROR]', error);
            return interaction.editReply('error while playing music: ```' + error.message + '```');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('[PLAYER] Finished');

            if (path.startsWith('http')) fs.unlink('./music.mp3', async error => {
                if (error) {
                    console.error(error);
                    await interaction.editReply('error while removing music file: ```' + error.message + '```');
                }
            });
            interaction.editReply('music finished, thank you for listening ig');
        });

        connection.subscribe(player);
        player.play(resource);

        await interaction.editReply('prepare thy ears');
    }
}