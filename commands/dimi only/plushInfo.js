const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
    URL = "https://camp-fire.jp/projects/970332/view",
    cheerio = require("cheerio");
let cache = {};

const fetchPlushInfo = async () => {
    const { plushCacheCD } = JSON.parse(fs.readFileSync('./config.json', 'utf-8')) || 6e4
    if (cache && Date.now() - cache.t < plushCacheCD) return;
    const plushInfo = await fetch(URL).then(async res => {
        if (!res.ok) throw new Error(res.statusText)
        return await res.text()
    })
    const $ = cheerio.load(plushInfo);
    if (!cache || Date.now() - cache.t > plushCacheCD) cache = {
        t: Date.now(),
        money: $('p.backer-amount.svelte-1005vm').text().replace('円', '') + '/' + $("p.target-amount span").text() + '円 (' + Math.round(
                        parseInt($("p.backer-amount.svelte-1005vm").text().replace('円', ''))
                        /
                        parseInt($("p.target-amount span").text().replace('円', '')) * 100
        ) + '%)',
        donors: $('p.backer.svelte-1005vm').text(),
        daysLeft: $('p.days-left.svelte-1005vm').text()
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("plush-info")
        .setDescription("fetch the info of the osage plush"),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            await fetchPlushInfo();
            const embed = new EmbedBuilder()
                .setTitle("Osage Plush Info")
                .setDescription("Information about the Osage Plush from Campfire")
                .setURL(URL)
                .addFields({
                    name: "Money raised",
                    value: cache.money
                }, {
                    name: "Amount of donors",
                    value: cache.donors
                }, {
                    name: "Days left",
                    value: cache.daysLeft
                }
                )
                .setColor(0x2b2b2b)
                .setFooter({ text: "Last updated" })
                .setTimestamp(cache.t);
            interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(error);
            interaction.editReply("Failed to fetch plush info: ```" + error.message + "```");
        }
    }
}