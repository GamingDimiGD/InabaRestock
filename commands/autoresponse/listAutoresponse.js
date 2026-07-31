const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    configPath = path.join(__dirname, '..', '..', 'config.json'),
    responsesPerPage = 10

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-autoresponse')
        .setDescription('List all autoresponses for this server'),
    async execute(interaction) {
        if (!interaction.guild) {
            return await interaction.reply('This command can only be used in a server.');
        }
        if (!interaction.guild.id === '1410959974842236930') return await interaction.reply('Other servers aren\'t supported yet.');
        const { autoResponseServers } = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const responses = autoResponseServers[interaction.guild.id].responses;
        if (!responses.length) return await interaction.reply('No autoresponses found for this server.');
        let embed = new EmbedBuilder()
            .setTitle('Autoresponses for this server')
            .setColor('#b2b2b2')
            .setDescription([ ...responses ].splice(0, responsesPerPage).map((response, index) => `**${index + 1}.** \`${response.triggers.join('`, `')}\` => ${response.response}\n-# Type: \`${response.type}\``).join('\n'))
            .setFooter({ text: `Page 1 of ${Math.ceil(responses.length / responsesPerPage)} | ${responses.length} autoresponses` });
        
        let row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('autoresponsePageSelector')
                    .setPlaceholder('Select a page')
                    .addOptions(
                        Array.from({ length: Math.ceil(responses.length / responsesPerPage) }, (_, i) => ({ label: `Page ${i + 1}`, value: `${i + 1}` }))
                    )
            )
        await interaction.reply({ embeds: [embed], components: [row] });
    },
    responsesPerPage
};