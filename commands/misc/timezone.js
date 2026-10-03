const { SlashCommandBuilder } = require("discord.js"), { stringSimilarity } = require('string-similarity-js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timezone")
        .setDescription("Get timezone from country or city")
        .addStringOption(option =>
            option.setName("tz")
                .setDescription("The timezone code thingy")
                .setRequired(true)
                .setAutocomplete(true)
        )
    ,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const timezones = Intl.supportedValuesOf('timeZone');
        if (!focusedValue) return await interaction.respond(timezones.slice(0, 25).map(tz => ({ name: tz, value: tz })));
        const filtered = [...timezones].sort((a, b) => stringSimilarity(focusedValue, b, Math.min(3, focusedValue.length)) - stringSimilarity(focusedValue, a, Math.min(3, focusedValue.length))).slice(0, 25).filter(tz => stringSimilarity(focusedValue, tz, Math.min(3, focusedValue.length)) > 0).map(tz => ({ name: tz, value: tz }));
        await interaction.respond(
            filtered.slice(0, 25).map(tz => ({ name: tz, value: tz }))
        );
    },
    async execute(interaction) {
        if (!Intl.supportedValuesOf('timeZone').includes(interaction.options.getString('tz'))) return await interaction.reply("Invalid timezone");
        await interaction.reply(Intl.DateTimeFormat('en-US', { timeZone: interaction.options.getString('tz'), dateStyle: 'full', timeStyle: 'long' }).format(new Date()));
    }
};