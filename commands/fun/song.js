const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"),
    fs = require("fs")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("song")
        .setDescription("Get a random Inabakumori Song (Sorted by BPM)")
        .addIntegerOption(option =>
            option.setName("number")
                .setDescription("Get specific song by number")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        await interaction.deferReply();
        const songs = JSON.parse(fs.readFileSync("./songs.json", "utf-8"));
        const number = interaction.options.getInteger("number") || Math.floor(Math.random() * songs.length) + 1
        if (number > songs.length || number < 1) return interaction.editReply(`invalid number, must be between 1 and ${songs.length}`);
        let song = songs[number - 1];
        const isYTLink = song.link.startsWith("https://youtu.be/");
        const embed = new EmbedBuilder()
            .setTitle(song.title)
            .setURL(song.link)
            .setDescription(`BPM: ${song.bpm}, Vocals: ${song.vocals}\nNumber ${number} of ${songs.length} (Sorted by BPM)`)
        if (isYTLink) embed.setImage(`https://img.youtube.com/vi/${song.link.replace("https://youtu.be/", "")}/0.jpg`);
        await interaction.editReply({ embeds: [embed] });
    },
};