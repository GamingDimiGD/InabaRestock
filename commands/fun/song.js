const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require("discord.js"),
    fs = require("fs"),
    { stringSimilarity } = require('string-similarity-js');

const findBestMatch = (search, songs) => {
    if (!search) return -1;
    const similarities = songs.map(song => Math.max(stringSimilarity(search, song?.searchName || '', 1), stringSimilarity(search, song.title, 1)));
    return similarities.indexOf(Math.max(...similarities));
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("song")
        .setDescription("Get a random Inabakumori Song (Sorted by BPM)")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel,
            InteractionContextType.BotDM
        )
        .addIntegerOption(option =>
            option.setName("number")
                .setDescription("Get specific song by number")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("search")
                .setDescription("Search for specific song by name")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        await interaction.deferReply();
        const songs = JSON.parse(fs.readFileSync("./songs.json", "utf-8"));
        const number = (
            interaction.options.getInteger("number")
            ?? findBestMatch(interaction.options.getString("search"), songs) + 1
        ) || Math.floor(Math.random() * songs.length) + 1
        if (number > songs.length || number < 1) return interaction.editReply(`invalid number, must be between 1 and ${songs.length}`);
        let song = songs[number - 1];
        const isYTLink = song.link.startsWith("https://youtu.be/");
        const embed = new EmbedBuilder()
            .setTitle(song.title)
            .setURL(song.link)
            .setDescription(`BPM: ${song.bpm}, Vocals: ${song.vocals}\nNumber ${number} of ${songs.length} (Sorted by BPM)`)
            .setFooter({ text: "Released at" })
        if (song.date && !song.dateAccuracy) embed.setTimestamp(song.date)
        else if (song.date && song.dateAccuracy === "y") embed.setFooter({ text: `Released at • ${new Date(song.date).getFullYear()}` })
        else if (song.date && song.dateAccuracy === "d") embed.setFooter({ text: `Released at • ${new Date(song.date).toDateString()}` })
        if (isYTLink) embed.setImage(`https://img.youtube.com/vi/${song.link.replace("https://youtu.be/", "")}/0.jpg`);
        await interaction.editReply({ embeds: [embed] });
    },
};