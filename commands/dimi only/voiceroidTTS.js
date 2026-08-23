const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource
} = require('@discordjs/voice'),
    { spawn } = require('child_process'),
    fs = require('fs'),
    { SlashCommandBuilder, MessageFlags } = require('discord.js')

const fetchVOICEVOX = async (text, voicebank) => {
    const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${voicebank}`;
    const fetched = await fetch(url);
    if (!fetched.ok) return console.log('error while fetching tts: ```' + fetch.statusText + '```');
    const tts = (await fetched.json()).mp3DownloadUrl
    let ttsFetch = await fetch(tts)
    if (!ttsFetch.ok) {
        let limit = 20
        return new Promise((resolve, reject) => {
            let interval = setInterval(async () => {
                if (limit-- < 0) {
                    reject();
                    return clearInterval(interval);
                }
                console.log("failed to fetch tts, retrying... (" + limit + " tries left)");
                ttsFetch = await fetch(tts);
                if (ttsFetch.ok) {
                    fs.writeFileSync('./tts.mp3', Buffer.from(await ttsFetch.arrayBuffer()));
                    console.log('fetched and downloaded tts, checking for corruption...');
                    const ffmpeg = spawn('ffmpeg', [
                        '-v', 'error',
                        '-i', 'tts.mp3',
                        '-f', 'null',
                        '-'
                    ]);
                    let isCorrupted = false;
                    ffmpeg.on('close', code => {
                        if (code !== 0) {
                            console.log('tts is corrupted, retrying...');
                            isCorrupted = true;
                            return;
                        }
                    })
                    if (!isCorrupted) {
                        clearInterval(interval);
                        resolve();
                    }
                }
            }, 1e4)
        })
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voiceroid-tts')
        .setDescription('Use the voiceroid\'s API to convert text to speech in VC\'s')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to convert to speech')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('voicebank')
                .setDescription('The voicebank')
        ),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        })
        if (!connection) return interaction.editReply({ content: 'join vc first', flags: MessageFlags.Ephemeral });
        await interaction.deferReply();
        const player = createAudioPlayer();
        const tts = await fetchVOICEVOX(interaction.options.getString('text'), interaction.options.getInteger('voicebank') ?? JSON.parse(fs.readFileSync('./config.json', 'utf8')).defaultVB ?? 108);
        const resource = createAudioResource('tts.mp3');
        player.play(resource);
        connection.subscribe(player);
        await interaction.editReply('speaking rn');
    }
}