const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-autoresponse')
        .setDescription('Add an autoresponse')
        .addStringOption(option =>
            option.setName('triggers')
                .setDescription('The trigger(s) to add, separated by commas')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to add')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of trigger')
                .setRequired(true)
                .addChoices(
                    { name: 'exact', value: 'exact' },
                    { name: 'includes', value: 'includes' },
                    { name: 'startsWith', value: 'startsWith' },
                    { name: 'endsWith', value: 'endsWith' },
                    { name: 'regex (advanced matching, §0 means first match of the regex, §1 means second match etc. Only 1 trigger allowed.)', value: 'regex' }
                )
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
        const type = interaction.options.getString('type');
        const message = interaction.options.getString('message');
        const triggers = type === 'regex' ? [message] : interaction.options.getString('triggers').split(',').map(s => s.trim());
        const autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf8'));
        if (
            message.length > 500 ||
            triggers.some(t => t.length > 50) ||
            triggers.some(t => t.length < 1) ||
            triggers.length > 5
        ) {
            return await interaction.reply('Invalid trigger(s) or response, responses should be less than 500 characters, triggers should be less than 50 characters and less than 5 triggers.');
        }
        if (!autoResponseServers[interaction.guild.id]) autoResponseServers[interaction.guild.id] = { enabled: true, responses: [] };
        if (autoResponseServers[interaction.guild.id].responses.length > 100) return await interaction.reply('You have reached the maximum number of autoresponses.');
        autoResponseServers[interaction.guild.id].responses.push({ triggers, response: message, type });
        fs.writeFileSync('./data/autoResponseServers.json', JSON.stringify(autoResponseServers, null, 4));
        await interaction.reply('Autoresponse added successfully!');
    }
};