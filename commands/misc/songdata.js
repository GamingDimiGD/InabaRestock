const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"),
    fs = require("fs"),
    { stringSimilarity } = require('string-similarity-js');

const findBestMatch = (search, songs) => {
    if (!search) return -1;
    const similarities = songs.map(song =>  stringSimilarity(search, song.title, Math.min(3, search.length)));
    return similarities.indexOf(Math.max(...similarities));
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("songdata")
        .setDescription("Get a random Inabakumori Song that is on YouTube and gets its data (Sorted by BPM)")
        .addIntegerOption(option =>
            option.setName("number")
                .setDescription("Get specific song by number")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("search")
                .setDescription("Search for specific song by name")
                .setRequired(false)
                .setAutocomplete(true)
        )
    ,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const songs = JSON.parse(fs.readFileSync("./songs.json", "utf-8")).filter(song => song.link.startsWith("https://youtu.be/"));
        if (!focusedValue) return await interaction.respond(songs.slice(0, 25).map(song => ({ name: `${songs.indexOf(song) + 1} - ${song.title}`, value: song.title })));
        const filtered = [...songs].sort((a, b) => stringSimilarity(focusedValue, b.title, Math.min(3, focusedValue.length)) - stringSimilarity(focusedValue, a.title, Math.min(3, focusedValue.length))).slice(0, 25).filter(song => stringSimilarity(focusedValue, song.title, Math.min(3, focusedValue.length)) > 0).map(song => ({ name: `${songs.indexOf(song) + 1} - ${song.title}`, value: song.title }));
        await interaction.respond(filtered);
    },
    async execute(interaction) {
        await interaction.deferReply();
        const songs = JSON.parse(fs.readFileSync("./songs.json", "utf-8")).filter(song => song.link.startsWith("https://youtu.be/"));
        const number = (
            interaction.options.getInteger("number")
            ?? findBestMatch(interaction.options.getString("search"), songs) + 1
        ) || Math.floor(Math.random() * songs.length) + 1
        if (number > songs.length || number < 1) return interaction.editReply(`invalid number, must be between 1 and ${songs.length}`);
        let song = songs[number - 1];
        const ytData = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${song.link.replace("https://youtu.be/", "")}&key=${process.env.YT_KEY}`).then(res => res.json());
        const embed = new EmbedBuilder()
            .setTitle(song.title)
            .setURL(song.link)
            .setDescription(Object.keys(ytData.items[0].statistics).filter(stat => stat !== "favoriteCount").map(stat => `${stat}: ${parseInt(ytData.items[0].statistics[stat]).toLocaleString("en-US")}`).join("\n"))
            .setFooter({ text: "Released at" })
            .setImage(`https://img.youtube.com/vi/${song.link.replace("https://youtu.be/", "")}/0.jpg`);
        if (song.date && !song.dateAccuracy) embed.setTimestamp(song.date)
        else if (song.date && song.dateAccuracy === "y") embed.setFooter({ text: `Released at • ${new Date(song.date).getFullYear()}` })
        else if (song.date && song.dateAccuracy === "d") embed.setFooter({ text: `Released at • ${new Date(song.date).toDateString()}` })
        await interaction.editReply({ embeds: [embed] });
    },
};