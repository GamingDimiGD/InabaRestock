const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require("discord.js"),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
    URL = "https://camp-fire.jp/projects/970332/view",
    cheerio = require("cheerio");
let cache = {};

const fetchPlushInfo = async () => {
    let { plushCacheCD } = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
    if (!plushCacheCD) plushCacheCD = 6e4
    if (typeof plushCacheCD === 'string') plushCacheCD = parseInt(plushCacheCD);
    if (Object.keys(cache).length && Date.now() - cache.t < plushCacheCD) return cache;
    const plushInfo = await fetch(URL).then(async res => {
        if (!res.ok) throw new Error(res.statusText)
        return await res.text()
    })
    const $ = cheerio.load(plushInfo);
    if (!Object.keys(cache).length || Date.now() - cache.t > plushCacheCD) cache = {
        t: Date.now(),
        "Money raised": $('p.backer-amount.svelte-1005vm').text().replace('円', '') + '/' + $("p.target-amount span").text() + '円 (' + Math.round(
            parseInt($("p.backer-amount.svelte-1005vm").text().replace('円', ''))
            /
            parseInt($("p.target-amount span").text().replace('円', '')) * 100
        ) + '%)',
        "Donor amount": $('p.backer.svelte-1005vm').text(),
        "Days left": $('p.days-left.svelte-1005vm').text(),
        "Followers or likes or whatever": $('.follow-button > span.count').text()
    };
    return cache
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("plush-info")
        .setDescription("fetch the info of the osage plush")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel,
            InteractionContextType.BotDM
        ),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const cache = await fetchPlushInfo();
            const embed = new EmbedBuilder()
                .setTitle("Osage Plush Info")
                .setDescription("Information about the Osage Plush from Campfire")
                .setURL(URL)
                .addFields(
                    ...Object.keys(cache).filter(k => k !== "t").map(k => {
                        return {
                            name: k,
                            value: cache[k]
                        }
                    })
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