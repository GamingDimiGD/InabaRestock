const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
    URL = "https://gamingdimigd.github.io/InabaRestockImageDB/",
    { stringSimilarity } = require('string-similarity-js');

const findBestMatch = (search, imageDataList) => {
    if (!search) return -1;
    const similarities = imageDataList.map(imageData => Math.max(stringSimilarity(search, imageData?.searchName || '', Math.min(3, search.length)), stringSimilarity(search, imageData.name, Math.min(3, search.length))));
    return similarities.indexOf(Math.max(...similarities));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('osagery')
        .setDescription('osage + imagery = osagery, get a random osage/inabakumori or related image')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('search for specific osagery by name')
                .setRequired(false)
                .setAutocomplete(true)
        )
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('get specific osagery by number')
                .setRequired(false)
        )
    ,
    async autocomplete(interaction) { 
        const focusedValue = interaction.options.getFocused();
        const imageDataList = await fetch(URL + "data.json?t=" + Date.now(), {
            cache: "no-store"
        }).then(res => res.text()).then(text => JSON.parse(text)).catch(() => []);
        if (!focusedValue) return await interaction.respond(imageDataList.slice(0, 25).map(imageData => ({ name: imageData.searchName || imageData.name, value: imageData.name })));
        await interaction.respond(
            imageDataList
                .sort((a, b) =>
                    Math.max(stringSimilarity(focusedValue, b.searchName || '', Math.min(3, focusedValue.length)), stringSimilarity(focusedValue, b.name, Math.min(3, focusedValue.length))) - Math.max(stringSimilarity(focusedValue, a.searchName || '', Math.min(3, focusedValue.length)), stringSimilarity(focusedValue, a.name, Math.min(3, focusedValue.length)))
                )
                .slice(0, 25)
                .filter(imageData => stringSimilarity(focusedValue, imageData.searchName || '', Math.min(3, focusedValue.length)) > 0 || stringSimilarity(focusedValue, imageData.name, Math.min(3, focusedValue.length)) > 0)
                .map(imageData => ({ name: imageData.searchName || imageData.name, value: imageData.name }))
        )
    },
    async execute(interaction) {
        await interaction.deferReply();
        const imageDataList = await fetch(URL + "data.json?t=" + Date.now(), {
            cache: "no-store",
        }).then(res => res.text()).then(text => JSON.parse(text));
        if (!imageDataList || !imageDataList.length) return interaction.editReply("something broke lmao");
        let number = (interaction.options.getInteger('number')
            ?? findBestMatch(interaction.options.getString('search'), imageDataList) + 1) 
            || Math.floor(Math.random() * imageDataList.length) + 1
        if (number > imageDataList.length || number < 1) return interaction.editReply(`invalid number, must be between 1 and ${imageDataList.length}`);
        let { name, submitted_by, artist, edited_by, searchName } = imageDataList[number - 1];
        let artistData, editedByData;
        if (artist) artistData = await fetch(URL + "artistData.json?t=" + Date.now(), {
            cache: "no-store",
        }).then(res => res.text()).then(text => JSON.parse(text));
        if (edited_by) editedByData = await fetch(URL + "editedByData.json?t=" + Date.now(), {
            cache: "no-store",
        }).then(res => res.text()).then(text => JSON.parse(text));
        if (edited_by) edited_by = editedByData[edited_by] ? `[${edited_by}](${editedByData[edited_by]})` : edited_by;
        if (typeof artist === "array" || artist instanceof Array) {
            artist = artist.map(a => artistData[a] ? `[${a}](${artistData[a]})` : a).join(", ")
        } else if ((typeof artist === "string" || artist instanceof String) && artistData[artist]) {
            artist = `[${artist}](${artistData[artist]})`;
        }

        const imageUrl = URL + "images/" + name;

        const submitter = await interaction.client.users.fetch(submitted_by).catch(() => null);
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(name)
                    .setImage(imageUrl)
                    .setDescription(`submitted by ${submitter ? `**${submitter?.globalName}**` : `unknown user id \`${submitted_by}\``}${artist ? `\nartist(s): ${artist}` : ""}${edited_by ? `\nedited by: ${edited_by}` : ""}${searchName ? `\nsearch-friendly name: ${searchName}` : ""}\nthis is osagery number ${number} of ${imageDataList.length}`)
                    .setColor('#b2b2b2')
        ] });
    }
}