const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource
} = require('@discordjs/voice'),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
    { SlashCommandBuilder, MessageFlags } = require('discord.js')

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
        await interaction.deferReply();
        const voiceChannel = interaction.member.voice.channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        })
        const player = createAudioPlayer();
        const text = interaction.options.getString('text');
        const voicebank = interaction.options.getInteger('voicebank') || JSON.parse(fs.readFileSync('./config.json', 'utf8')).defaultVB || 108;
        const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${voicebank}`;
        const response = await fetch(url);
        if (!response.ok) return await interaction.editReply('error while fetching tts: ```' + response.statusText + '```');
        const tts = (await response.json()).mp3DownloadUrl
        let ttsFetch = await fetch(tts);
        if (!ttsFetch.ok) {
            let limit = 10
            await new Promise((resolve, reject) => {
                let interval = setInterval(async () => {
                    if (limit-- < 0) {
                        reject();
                        return clearInterval(interval);
                    }
                    await interaction.editReply("failed to fetch tts, retrying... (" + limit + " tries left)");
                    ttsFetch = await fetch(tts);
                    if (ttsFetch.ok) {
                        resolve();
                        return clearInterval(interval);
                    }
                }, 2e3)
            })
            if (!ttsFetch.ok) return await interaction.editReply("failed after 10 tries, aborting the command");
        }
        const resource = createAudioResource(tts);
        player.play(resource);
        connection.subscribe(player);
        await interaction.editReply('speaking rn');
    }
}