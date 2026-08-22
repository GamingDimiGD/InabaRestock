const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    configPath = path.join(__dirname, '../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editconfig')
        .setDescription('Edit bot configuration settings')
        .addStringOption(option =>
            option.setName('key')
                .setDescription('The key to edit')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('value')
                .setDescription('The value to set')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('typeof')
                .setDescription('the type of the value')
                .addChoices(
                    { name: 'string', value: 'string' },
                    { name: 'number', value: 'number' },
                    { name: 'boolean', value: 'boolean' },
                    { name: 'array (split with commas only)', value: 'array' },
                    { name: 'json', value: 'json' },
                    { name: 'null', value: 'null' },
                    { name: 'delete', value: 'delete' }
                )
        )
    ,
    async execute(interaction) {
        const key = interaction.options.getString('key'),
            type = interaction.options.getString('typeof') || 'string';
        let value = interaction.options.getString('value'), config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (type === 'json') value = JSON.parse(value);
        else if (type === 'array') value = value.split(',').map(s => s.trim())
        else if (type === 'null') value = null
        else if (type === 'delete') delete config[key]
        else if (type === 'boolean') value = value.toLowerCase() === 'true'
        else if (type === 'number') value = parseFloat(value);
        else config[key] = value;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        await interaction.reply(`Config ${key} has been set to ${value} (type: ${type}).`);
    }
};