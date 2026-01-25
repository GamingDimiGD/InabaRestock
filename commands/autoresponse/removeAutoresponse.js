const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    configPath = path.join(__dirname, '..', '..', 'config.json');

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
        if (interaction.guild.id !== '1410959974842236930') return await interaction.reply('Other servers aren\'t supported yet.');
        const trigger = interaction.options.getString('trigger');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const saidTrigger = config.autoResponseServers[interaction.guild.id].responses.find(response => response.triggers.includes(trigger));
        if (!saidTrigger) return await interaction.reply('No autoresponse found with that trigger.');
        config.autoResponseServers[interaction.guild.id].responses = config.autoResponseServers[interaction.guild.id].responses.filter(response => response.triggers.includes(trigger) === false);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        await interaction.reply('Autoresponse removed successfully!');
    }
};