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
        const songs = JSON.parse(fs.readFileSync("./songs.json", "utf-8"));
        let song = songs[interaction.options.getInteger("number") - 1] || songs[Math.floor(Math.random() * songs.length)];
        const embed = new EmbedBuilder()
            .setTitle(song.name)
            .setURL(song.link)
            .setDescription(`BPM: ${song.bpm}, Vocals: ${song.vocals}`)
        await interaction.reply({ embeds: [embed], content: song.link });
    },
};