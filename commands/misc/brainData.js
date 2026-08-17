const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"),
    fs = require("fs")


const toFileSize = (bytes) => {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1000) {
        n /= 1000;
        l++;
    }
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("brain-data")
        .setDescription("Check current stock of inabakumori")
    ,
    async execute(interaction) {
        const tinyBrain = JSON.parse(fs.readFileSync('./ai/tinyBrain.json', 'utf-8')),
            smallBrain = JSON.parse(fs.readFileSync('./ai/smallBrain.json', 'utf-8')),
            brain = JSON.parse(fs.readFileSync('./ai/brain.json', 'utf-8')),
            starterBrain = JSON.parse(fs.readFileSync('./ai/starterBrain.json', 'utf-8'));
        const embed = new EmbedBuilder()
            .setTitle("InabaRestock's AI Brain data")
            .addFields(
                [tinyBrain, smallBrain, brain, starterBrain].map((b, i) => ({
                    name: i === 0 ? "Tiny Brain" : i === 1 ? "Small Brain" : i === 2 ? "Brain" : "Starter Brain",
                    value: `Size: ${toFileSize(Object.keys(b).length)}\nKeys: ${Object.keys(b).length}`,
                }))
        )
        interaction.reply({ embeds: [embed] });
    },
};