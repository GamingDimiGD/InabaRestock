const { SlashCommandBuilder, AttachmentBuilder, InteractionContextType } = require("discord.js"),
    { execFile } = require("child_process"),
    fs = require("fs"),
    fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
let lastBoil = 0;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("boil")
        .setDescription("Creates a video of someone boiling the mentioned user's pfp")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        )
        .addMentionableOption(option =>
            option.setName("user")
                .setDescription("The user to boil")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const { boilCD: commandCooldown, boilURL } = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        if (!boilURL) return await interaction.reply('boil url is not set in `config.json`, pls tell dimi about this');
        if (!interaction.options.getMentionable('user').user) return await interaction.reply('invite me to this server pls otherwise the command won\'t work for some reason');
        let pfp = interaction.options.getMentionable('user').user.displayAvatarURL({ format: 'png' });
        if (!pfp) return await interaction.reply('user not found!');
        if (pfp.endsWith('.webp')) pfp = pfp.replace('.webp', '.png');
        if (Date.now() - lastBoil < commandCooldown) return await interaction.reply('i need a break bro my cpu\'s getting fried, i\'ll be back <t:' + Math.floor((lastBoil + commandCooldown) / 1e3) + ':R>');
        lastBoil = Date.now();
        await interaction.reply('hold on a sec, im boiling...');
        console.log('[boil] Boiling ' + pfp);
        let urlTest = await fetch(boilURL);
        if (!urlTest.ok) {
            console.log('[boil] Invalid boil url!');
            return await interaction.editReply("`/boil`'s url is may be invalid, server responded with code " + urlTest.status);
        }
        await execFile('ffmpeg', [
            '-i', boilURL,
            '-i', pfp,

            '-filter_complex',
            '[1:v]scale=300:300,colorchannelmixer=aa=0.5[img];' +
            '[0:v][img]overlay=' +
            '(main_w-overlay_w)/2:' +
            '(main_h-overlay_h)/2:' +
            'enable=\'between(t,5,19)\'',

            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            // '-threads', '0',
            '-pix_fmt', 'yuv420p',

            '-y',
            'output.mp4'
        ], async (error) => {
            if (error) {
                await interaction.editReply('error error on the wall')
                return console.error(error);
            }
            console.log('[boil] Boiled!');
            await interaction.editReply({ content: 'boiled <@' + interaction.options.getMentionable('user').user + '>', files: [new AttachmentBuilder('output.mp4', { name: 'boil.mp4' })] });
        })
    }
};