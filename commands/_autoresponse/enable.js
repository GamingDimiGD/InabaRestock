const { SlashCommandSubcommandBuilder } = require('discord.js'),
    fs = require('fs'), { stringSimilarity } = require('string-similarity-js');

const findBestMatch = (search, triggers) => {
    if (!search) return -1;
    const similarities = triggers.map(trigger => stringSimilarity(search, trigger, 2));
    return similarities.indexOf(Math.max(...similarities));
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Disable an autoresponse for yourself (server-specific)")
        .addStringOption(option =>
            option.setName("trigger")
                .setDescription("The trigger to remove")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const { disabledAutoResponses: autoResponseServers } = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'))[interaction.user.id];
        if (!focusedValue) return await interaction.respond(autoResponseServers[interaction.guild.id].slice(0, 25).map(trigger => ({ name: trigger, value: trigger })));
        const filtered = autoResponseServers[interaction.guild.id].sort((a, b) => stringSimilarity(focusedValue, b, Math.min(3, focusedValue.length)) - stringSimilarity(focusedValue, a, Math.min(3, focusedValue.length))).slice(0, 25).filter(trigger => stringSimilarity(focusedValue, trigger, Math.min(3, focusedValue.length)) > 0).map(trigger => ({ name: trigger, value: trigger }));
        await interaction.respond(filtered);
    },
    async execute(interaction) {
        if (!interaction.guild) {
            return await interaction.reply('This command can only be used in a server.');
        }
        const trigger = interaction.options.getString('trigger');
        let autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf8'));
        const saidTrigger = autoResponseServers[interaction.guild.id].responses.find(response => response.triggers.includes(trigger));
        if (!saidTrigger) return await interaction.reply('No autoresponse found with that trigger.');
        let userData = JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"));
        let { disabledAutoResponses } = userData[interaction.user.id] ? userData[interaction.user.id] : userData[interaction.user.id] = {};
        if (!disabledAutoResponses) return await interaction.reply('You have not disabled any autoresponses.');
        let serverDisabledAutoResponses = disabledAutoResponses[interaction.guild.id] ? disabledAutoResponses[interaction.guild.id] : userData[interaction.user.id].disabledAutoResponses[interaction.guild.id] = disabledAutoResponses[interaction.guild.id] = [];
        if (!serverDisabledAutoResponses.includes(trigger)) return await interaction.reply('You did not disable that autoresponse.');
        userData[interaction.user.id].disabledAutoResponses[interaction.guild.id] = userData[interaction.user.id].disabledAutoResponses[interaction.guild.id].filter(response => response !== trigger);
        fs.writeFileSync(`./data/users.json`, JSON.stringify(userData));
        await interaction.reply('Autoresponse enabled successfully!');
    }
};