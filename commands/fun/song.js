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
        let song = songs[interaction.options.getInteger("number") - 1] || songs[Math.floor(Math.random() * songs.length)];
        const isYTLink = song.link.startsWith("https://youtu.be/");
        const embed = new EmbedBuilder()
            .setTitle(song.title)
            .setURL(song.link)
            .setDescription(`BPM: ${song.bpm}, Vocals: ${song.vocals}`)
        if (isYTLink) embed.setImage(`https://img.youtube.com/vi/${song.link.replace("https://youtu.be/", "")}/0.jpg`);
        await interaction.editReply({ embeds: [embed] });
    },
};