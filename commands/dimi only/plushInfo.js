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
        try {
            const $ = await fetchPlushInfo();
            const embed = new EmbedBuilder()
                .setTitle("Osage Plush Info")
                .setDescription("Information about the Osage Plush from Camp-Fire")
                .setURL(URL)
                .addFields({
                    name: "Money raised",
                    value: $("p.backer-amount")[0].text().replace('円', '') + '/' + $("p.target-amount span")[0].text() + '円 (' + Math.round($("p.target-amount span")[0].text() / $("p.backer-amount")[0].text().replace('円', '') * 100) + '%)'
                }, {
                    name: "Amount of donors",
                    value: $("p.backer")[0].text()
                }, {
                    name: "Days left",
                    value: $("p.days-left")[0].text()
                }
                )

        } catch (error) { }
    }
}