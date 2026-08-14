const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js"),
    { execFile } = require("child_process"),
    fs = require("fs");

let lastBoil = 0;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("boil")
        .setDescription("Creates a video of someone boiling the mentioned user's pfp")
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
                await interaction.editReply({ content: 'error: ' + error.slice(0, 100) });
                return console.error(error);
            }
            console.log('[boil] Boiled!');
            await interaction.editReply({ content: 'boiled <@' + interaction.options.getMentionable('user').user + '>', files: [new AttachmentBuilder('output.mp4', { name: 'boil.mp4' })] });
        })
    }
};