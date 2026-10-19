const { SlashCommandSubcommandBuilder } = require('discord.js'),
    fs = require('fs'), { stringSimilarity } = require('string-similarity-js');

const findBestMatch = (search, triggers) => {
    if (!search) return -1;
    const similarities = triggers.map(trigger => stringSimilarity(search, trigger, 2));
    return similarities.indexOf(Math.max(...similarities));
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable an autoresponse for yourself (server-specific)")
        .addStringOption(option =>
            option.setName("trigger")
                .setDescription("The trigger to remove")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf8'));
        if (!autoResponseServers[interaction.guild.id] || !autoResponseServers[interaction.guild.id].responses || !focusedValue) return await interaction.respond([]);
        const filtered = autoResponseServers[interaction.guild.id].responses.map(response => response.triggers[findBestMatch(focusedValue, response.triggers)]).sort((a, b) => stringSimilarity(focusedValue, b, Math.min(3, focusedValue.length)) - stringSimilarity(focusedValue, a, Math.min(3, focusedValue.length))).slice(0, 25).filter(trigger => stringSimilarity(focusedValue, trigger, Math.min(3, focusedValue.length)) > 0).map(trigger => ({ name: trigger, value: trigger }));
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
        const userData = JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"));
        const { disabledAutoResponses } = userData[interaction.user.id] ? userData[interaction.user.id] : userData[interaction.user.id] = {};
        if (!disabledAutoResponses) disabledAutoResponses = userData[interaction.user.id].disabledAutoResponses = {};
        const serverDisabledAutoResponses = disabledAutoResponses[interaction.guild.id] ? disabledAutoResponses[interaction.guild.id] : userData[interaction.user.id].disabledAutoResponses[interaction.guild.id] = disabledAutoResponses[interaction.guild.id] = [];
        if (serverDisabledAutoResponses.includes(trigger)) return await interaction.reply('You already disabled that autoresponse.');
        userData[interaction.user.id].disabledAutoResponses[interaction.guild.id].push(trigger);
        fs.writeFileSync(`./data/users.json`, JSON.stringify(userData));
        await interaction.reply('Autoresponse disabled successfully!\nThis applies to every single trigger of the autoresponse.');
    }
};