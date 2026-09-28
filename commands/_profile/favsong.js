const { SlashCommandSubcommandBuilder } = require('discord.js'),
    fs = require("fs"),
    { stringSimilarity } = require('string-similarity-js');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("favsong")
        .setDescription("Set your favorite song (globally)")
        .addStringOption(option =>
            option.setName("song")
                .setDescription("The song to set")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const songs = JSON.parse(fs.readFileSync("./songs.json", "utf-8"));
        if (!focusedValue) return await interaction.respond(songs.slice(0, 25).map(song => ({ name: `${songs.indexOf(song) + 1} - ${song.title}`, value: song.title })));
        const filtered = [...songs].sort((a, b) => stringSimilarity(focusedValue, b.title, Math.min(3, focusedValue.length)) - stringSimilarity(focusedValue, a.title, Math.min(3, focusedValue.length))).slice(0, 25).filter(song => stringSimilarity(focusedValue, song.title, Math.min(3, focusedValue.length)) > 0).map(song => ({ name: `${songs.indexOf(song) + 1} - ${song.title}`, value: song.title }));
        await interaction.respond(filtered);
    },
    async execute(interaction) {
        await interaction.deferReply();
        const songs = JSON.parse(fs.readFileSync("./songs.json", "utf-8"));
        let song = songs.find(song => song.title === interaction.options.getString("song"));
        if (!song) return interaction.editReply("no such song, please use the autocomplete to find your song");
        if (!fs.existsSync(`./data/users.json`)) fs.writeFileSync(`./data/users.json`, "{}");
        let userData = JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"))
        if (!userData[interaction.user.id]) userData[interaction.user.id] = {};
        userData[interaction.user.id].favSong = song.title;
        fs.writeFileSync(`./data/users.json`, JSON.stringify(userData));
        interaction.editReply(`your favorite song has been set to ${song.title}!`);
    },
}