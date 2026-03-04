const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    brainPath = path.join(__dirname, '../../ai/brain.json'),
    { learn } = require('../../ai/gainSentience.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlearn')
        .setDescription('brain surgery')       
        .addStringOption(option =>
            option.setName("input")
                .setDescription("The input search for and unlearn")
                .setRequired(true)
        ),
    async execute(interaction) {
        const input = interaction.options.getString("input")
        let brain = JSON.parse(fs.readFileSync(brainPath));
        let matchedKeys = Object.keys(brain).filter(key => key.includes(input));
        let message = await interaction.reply({ content: "found: " + matchedKeys.join(", ").slice(0, 1993), components: [new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_unlearn')
                .setLabel('Unlearn')
                .setStyle(ButtonStyle.Danger)
            )]
        });
        const filter = i => i.customId === 'confirm_unlearn' && i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 15000 });
        collector.on('collect', async i => {
            await i.deferUpdate();
            matchedKeys.forEach(key => delete brain[key]);
            fs.writeFileSync(brainPath, JSON.stringify(brain));
            await i.editReply("unlearned em");
            collector.stop();
        });
        collector.on('end', collected => {
            if (collected.size === 0) {
                message.edit("unlearn cancelled: no confirmation received");
            }
        });
    }
};