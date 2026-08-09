const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js'),
    fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-autoresponse')
        .setDescription('List all autoresponses for this server'),
    async execute(interaction) {
        if (!interaction.guild) {
            return await interaction.reply('This command can only be used in a server.');
        }
        // if (!interaction.guild.id === '1410959974842236930') return await interaction.reply('Other servers aren\'t supported yet.');
        const autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf8'));
        if (!autoResponseServers[interaction.guild.id]) return await interaction.reply('No autoresponses found for this server.');
        const responses = autoResponseServers[interaction.guild.id].responses;
        if (!responses.length) return await interaction.reply('No autoresponses found for this server.');
        const entries = responses.map((response, index) =>
            `**${index + 1}.** \`${response.triggers.join('`, `')}\` => ${response.response}\n-# Type: \`${response.type}\``
        );

        const pages = [];
        let currentPage = '';

        for (const entry of entries) {
            if (currentPage.length + entry.length + 2 > 1000) {
                pages.push(currentPage);
                currentPage = entry;
            } else {
                currentPage += (currentPage ? '\n' : '') + entry;
            }
        }

        if (currentPage) pages.push(currentPage);

        let embed = new EmbedBuilder()
            .setTitle('Autoresponses for this server')
            .setColor('#b2b2b2')
            .setDescription(pages[0])
            .setFooter({ text: `Page 1 of ${pages.length} | ${responses.length} autoresponses` });

        let row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('autoresponsePageSelector')
                    .setPlaceholder('Select a page')
                    .addOptions(
                        Array.from({ length: pages.length }, (_, i) => ({ label: `Page ${i + 1}`, value: `${i + 1}` }))
                    )
            )
        await interaction.reply({ embeds: [embed], components: [row] })
    }
};