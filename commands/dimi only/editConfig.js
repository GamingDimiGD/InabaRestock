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
    ,
    async execute(interaction) {
        const key = interaction.options.getString('key');
        const value = interaction.options.getString('value');
        let config = require('../../config.json');
        config[key] = value;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        await interaction.reply(`Config ${key} has been set to ${value}.`);
    }
};