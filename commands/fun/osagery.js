const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js'),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
    URL = "https://gamingdimigd.github.io/InabaRestockImageDB/",
    { stringSimilarity } = require('string-similarity-js');

const findBestMatch = (search, imageDataList) => {
    if (!search) return -1;
    const similarities = imageDataList.map(imageData => Math.max(stringSimilarity(search, imageData?.searchName || '', 1), stringSimilarity(search, imageData.name, 1)));
    return similarities.indexOf(Math.max(...similarities));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('osagery')
        .setDescription('osage + imagery = osagery, get a random osage/inabakumori or related image')
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel,
            InteractionContextType.BotDM
        )
        .addStringOption(option =>
            option.setName('search')
                .setDescription('search for specific osagery by name')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('get specific osagery by number')
                .setRequired(false)
        )
    ,
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
            ]
        });
    }
}