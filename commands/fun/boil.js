const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js"),
    { execFile } = require("child_process"),
    boilURL = 'https://cdn.discordapp.com/attachments/1411289295070826496/1537817706626154586/20260727_1356201.mp4?ex=6a806bd8&is=6a7f1a58&hm=0b68cf5fd8cc0325de9c2718f5545355d07a4f2ea17382ec442d02a1811159e8&',
    commandCooldown = 1e3 * 60 * 15;

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
        const pfp = interaction.options.getMentionable('user').user.displayAvatarURL({ format: 'png' });
        if (Date.now() - lastBoil < commandCooldown) return await interaction.reply('i need a break bro my cpu\'s getting fried, i\'ll be back <t:' + Math.floor((lastBoil + commandCooldown) / 1e3) + ':R>');
        lastBoil = Date.now();
        await interaction.reply('hold on a sec, im boiling...');
        execFile('ffmpeg', [
            '-i', boilURL,
            '-i', pfp,

            '-filter_complex',
            '[1:v]scale=350:350[img];' +
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
                return console.error(error);
                // await interaction.editReply({ content: 'error: ' + error.slice(0, 100) });
            }
            await interaction.editReply({ files: [new AttachmentBuilder('output.mp4', { name: 'boil.mp4' })] });
        })
    }
};