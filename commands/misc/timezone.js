const { SlashCommandBuilder } = require("discord.js"), { stringSimilarity } = require('string-similarity-js'), fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timezone")
        .setDescription("Get timezone from country or city")
        .addStringOption(option =>
            option.setName("tz")
                .setDescription("The timezone code thingy")
                .setRequired(false)
                .setAutocomplete(true)
    )
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to get the timezone of")
                .setRequired(false)
        )
    ,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const timezones = Intl.supportedValuesOf('timeZone');
        if (!focusedValue) return await interaction.respond(timezones.slice(0, 25).map(tz => ({ name: tz, value: tz })));
        const filtered = [...timezones].sort((a, b) => stringSimilarity(focusedValue, b, Math.min(3, focusedValue.length)) - stringSimilarity(focusedValue, a, Math.min(3, focusedValue.length))).slice(0, 25).filter(tz => stringSimilarity(focusedValue, tz, Math.min(3, focusedValue.length)) > 0).map(tz => ({ name: tz, value: tz }));
        await interaction.respond(filtered);
    },
    async execute(interaction) {
        const user = interaction.options.getUser("user"), { timezone } = user ? JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"))[user.id] || {} : {};

        if (timezone) return await interaction.reply(Intl.DateTimeFormat('en-US', { timeZone: timezone, dateStyle: 'full', timeStyle: 'long' }).format(new Date()));

        if (!Intl.supportedValuesOf('timeZone').includes(interaction.options.getString('tz'))) return await interaction.reply("Invalid timezone");
        await interaction.reply(Intl.DateTimeFormat('en-US', { timeZone: interaction.options.getString('tz'), dateStyle: 'full', timeStyle: 'long' }).format(new Date()));
    }
};