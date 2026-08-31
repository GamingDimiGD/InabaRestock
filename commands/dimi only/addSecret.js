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
                .setDescription('The message to add (\\n = newline)')
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
                    { name: 'regex', value: 'regex' }
                )
        )
    ,
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const message = interaction.options.getString('message').replaceAll('\\n', '\n');
        const triggers = interaction.options.getString('triggers').split(',').map(s => s.trim());
        const secretResponses = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf8'));
        secretResponses.push({ response: message, triggers, type, discovered: false });
        fs.writeFileSync('./data/secretAutoResponses.json', JSON.stringify(secretResponses, null, 4));
        await interaction.reply({
            content: 'Autoresponse added successfully!' + (type === 'regex' ? `\n-# §0 means first match, §1 means second match etc. Only 1 trigger is allowed for regex autoresponses.` : ''),
            flags: MessageFlags.Ephemeral
        });
    }
};