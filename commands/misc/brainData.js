const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"), db = require('../../ai/database.js'), fs = require('fs');

const toFileSize = (bytes) => {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1000) {
        n /= 1000;
        l++;
    }
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`
}

const countKeys = db.prepare(`
    SELECT COUNT(DISTINCT context) AS count
    FROM ngrams
    WHERE n = ?
`);
const countStarters = db.prepare('SELECT COUNT(*) AS count FROM starters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("brain-data")
        .setDescription("Check the brain data of the AI")
    ,
    async execute(interaction) {
        await interaction.deferReply();
        const embed = new EmbedBuilder()
            .setTitle("InabaRestock's AI Brain data")
            .addFields(
                [countKeys.get(1).count, countKeys.get(2).count, countKeys.get(3).count, countStarters.get().count].map((b, i) => ({
                    name: i === 0 ? "Tiny Brain" : i === 1 ? "Small Brain" : i === 2 ? "Brain" : "Starter Brain",
                    value: `Keys: ${b}`,
                }))
        )
            .setFooter({ text: "Brain size: " + toFileSize(fs.readFileSync('./ai/brain.db', 'utf-8').length) })
        await interaction.editReply({ embeds: [embed] });
    },
};