const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
    URL = "https://camp-fire.jp/projects/970332/view",
    cheerio = require("cheerio");

const fetchPlushInfo = async () => {
    const plushInfo = await fetch(URL).then(async res => {
        if (!res.ok) throw new Error(res.statusText)
        return await res.text()
    })
    return cheerio.load(plushInfo);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("plush-info")
        .setDescription("fetch the info of the osage plush"),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const $ = await fetchPlushInfo();
            const embed = new EmbedBuilder()
                .setTitle("Osage Plush Info")
                .setDescription("Information about the Osage Plush from Camp-Fire")
                .setURL(URL)
                .addFields({
                    name: "Money raised",
                    value: $('p.backer-amount.svelte-1005vm').text().replace('円', '') + '/' + $("p.target-amount span").text() + '円 (' + Math.round(
                        parseInt($("p.backer-amount.svelte-1005vm").text().replace('円', ''))
                        /
                        parseInt($("p.target-amount span").text().replace('円', '')) * 100
                    ) + '%)'
                }, {
                    name: "Amount of donors",
                    value: $("p.backer.svelte-1005vm").text()
                }, {
                    name: "Days left",
                    value: $("p.days-left.svelte-1005vm").text()
                }
                )
                .setColor(0x2b2b2b)
            interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(error);
            interaction.editReply("Failed to fetch plush info: ```" + error.message + "```");
        }
    }
}