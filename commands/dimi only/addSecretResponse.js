const { SlashCommandBuilder, MessageFlags } = require('discord.js'),
    fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-secret')
        .setDescription('Add a secret response')
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
                    { name: 'endsWith', value: 'endsWith' }
                )
        )
    ,
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const message = interaction.options.getString('message');
        const triggers = interaction.options.getString('triggers').split(',').map(s => s.trim());
        const secretResponses = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf8'));
        secretResponses.push({ response: message, triggers, type, discovered: false });
        fs.writeFileSync('./data/secretAutoResponses.json', JSON.stringify(secretResponses, null, 4));
        await interaction.reply({ content: 'Secret response added successfully!', flags: MessageFlags.Ephemeral });
    }
};