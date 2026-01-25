const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    configPath = path.join(__dirname, '..', '..', 'config.json');

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
                .setDescription('The type of trigger (exact, includes, startsWith)')
                .setRequired(true)
                .addChoices(
                    { name: 'exact', value: 'exact' },
                    { name: 'includes', value: 'includes' },
                    { name: 'startsWith', value: 'startsWith' }
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
        if (interaction.guild.id !== '1410959974842236930') return await interaction.reply('Other servers aren\'t supported yet.');
        const type = interaction.options.getString('type');
        const message = interaction.options.getString('message');
        const triggers = interaction.options.getString('triggers').split(',').map(s => s.trim());
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // if (!config.autoResponseServers[interaction.guild.id]) config.autoResponseServers[interaction.guild.id] = { enabled: true, responses: [] };
        config.autoResponseServers[interaction.guild.id].responses.push({ response: message, triggers, type });
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        await interaction.reply('Autoresponse added successfully!');
    }
};