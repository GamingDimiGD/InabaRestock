const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    brainPath = path.join(__dirname, '../../ai/brain.json'),
      { learn } = require('../../ai/gainSentience.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('learn')
        .setDescription('shove a sentence up the brain')       
        .addStringOption(option =>
            option.setName("input")
                .setDescription("The input to learn")
                .setRequired(true)
        ),
    async execute(interaction) {
        const input = interaction.options.getString("input").split("|")
        input.forEach(learn)
        interaction.reply("learned: " + input);
    }
};