const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js"),
    { execFile } = require("child_process"),
    boilURL = 'https://cdn.discordapp.com/attachments/1414149221665214496/1531359849344929975/20260727_135620.mp4?ex=6a7fffbf&is=6a7eae3f&hm=d8e7cde34fc05bd52808f8af39f4d0187da24ce425694d844b9b114833c005a0&'

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
            '-c:a', 'aac',
            '-y',
            'output.mp4'
        ], async (stderr, stdout, error) => {
            if (error) {
                console.error(error);
                // await interaction.editReply({ content: 'error: ' + error.slice(0, 100) });
            }
            await interaction.editReply({ files: [new AttachmentBuilder('output.mp4', { name: 'boil.mp4' })] });
        })
    }
};