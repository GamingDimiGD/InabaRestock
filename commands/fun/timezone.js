const { SlashCommandBuilder } = require("discord.js");

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
        const filtered = timezones.filter(tz => tz.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(
            filtered.slice(0, 25).map(tz => ({ name: tz, value: tz }))
        );
    },
    async execute(interaction) {
        await interaction.reply(Intl.DateTimeFormat('en-US', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' }).format(new Date()));
    }
};