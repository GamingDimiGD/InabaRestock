const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-autoresponse')
        .setDescription('Remove an autoresponse')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('The trigger to remove')
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        if (!interaction.guild) {
            return await interaction.reply('This command can only be used in a server.');
        }
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply('You do not have permission to use this command.');
        }
        // if (interaction.guild.id !== '1410959974842236930') return await interaction.reply('Other servers aren\'t supported yet.');
        const trigger = interaction.options.getString('trigger');
        let autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf8'));
        const saidTrigger = autoResponseServers[interaction.guild.id].responses.find(response => response.triggers.includes(trigger));
        if (!saidTrigger) return await interaction.reply('No autoresponse found with that trigger.');
        autoResponseServers[interaction.guild.id].responses = autoResponseServers[interaction.guild.id].responses.filter(response => response.triggers.includes(trigger) === false);
        if (!autoResponseServers[interaction.guild.id].responses.length) delete autoResponseServers[interaction.guild.id];
        fs.writeFileSync('./data/autoResponseServers.json', JSON.stringify(autoResponseServers, null, 4));
        await interaction.reply('Autoresponse removed successfully!');
    }
};