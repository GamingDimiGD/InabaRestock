const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle-autoresponse')
        .setDescription('Toggle autoresponse for this server'),
    async execute(interaction) {
        if (!interaction.guild) {
            return await interaction.reply('This command can only be used in a server.');
        }
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply('You do not have permission to use this command.');
        }
        // if (interaction.guild.id !== '1410959974842236930') return await interaction.reply('Other servers aren\'t supported yet.');
        const autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf8'));
        autoResponseServers[interaction.guild.id].enabled = !autoResponseServers[interaction.guild.id].enabled;
        fs.writeFileSync('./data/autoResponseServers.json', JSON.stringify(autoResponseServers, null, 4));
        await interaction.reply(`Autoresponse for this server is now ${autoResponseServers[interaction.guild.id].enabled ? 'enabled' : 'disabled'}.`);
    },
};