const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

const contributionList = {
    "658854081590198272": "Helped hosting the `/boil` command's API"
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("contributions")
        .setDescription("Check everyone who contributed to this bot!")
    ,
    async execute(interaction) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Contributors")
                    .setDescription(
                        [...await Promise.all(
                            Object.keys(contributionList).map(async (id) => {
                                const user = interaction.client.users.cache.get(id) || await interaction.client.users.fetch(id);
                                return `${user.username}: ${contributionList[id]}`;
                            })
                        )].join('\n')
                    )
            ]
        })
    },
};