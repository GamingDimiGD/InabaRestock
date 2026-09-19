const { SlashCommandBuilder } = require('discord.js'),
    fs = require('fs'), { stringSimilarity } = require('string-similarity-js');

const findBestMatch = (search, triggers) => {
    if (!search) return -1;
    const similarities = triggers.map(trigger => stringSimilarity(search, trigger, 2));
    return similarities.indexOf(Math.max(...similarities));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-autoresponse')
        .setDescription('Remove an autoresponse')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('The trigger to remove')
                .setRequired(true)
                .setAutocomplete(true)
        )
    ,
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
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply('You do not have permission to use this command.');
        }
        // if (interaction.guild.id !== '1410959974842236930') return await interaction.reply('Other servers aren\'t supported yet.');
        const trigger = interaction.options.getString('trigger');
        let autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf8'));
        const saidTrigger = autoResponseServers[interaction.guild.id].responses.find(response => response.triggers.includes(trigger));
        if (!saidTrigger) return await interaction.reply('No autoresponse found with that trigger.');
        autoResponseServers[interaction.guild.id].responses = autoResponseServers[interaction.guild.id].responses.filter(response => response.triggers.includes(trigger) === false);
        if (!autoResponseServers[interaction.guild.id].responses.length) delete autoResponseServers[interaction.guild.id];
        fs.writeFileSync('./data/autoResponseServers.json', JSON.stringify(autoResponseServers, null, 4));
        await interaction.reply('Autoresponse removed successfully!');
    }
};