const { SlashCommandSubcommandBuilder } = require('discord.js'),
    fs = require("fs"),
    { stringSimilarity } = require('string-similarity-js');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("timezone")
        .setDescription("Set your prefered timezone")
        .addStringOption(option =>
            option.setName("tz")
                .setDescription("The timezone code thingy to set")
                .setRequired(true)
                .setAutocomplete(true)
        ),
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
        await interaction.deferReply();
        if (!Intl.supportedValuesOf('timeZone').includes(interaction.options.getString('tz'))) return await interaction.editReply("Invalid timezone");
        const tz = interaction.options.getString('tz');
        if (!fs.existsSync(`./data/users.json`)) fs.writeFileSync(`./data/users.json`, "{}");
        let userData = JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"))
        if (!userData[interaction.user.id]) userData[interaction.user.id] = {};
        userData[interaction.user.id].timezone = tz;
        fs.writeFileSync(`./data/users.json`, JSON.stringify(userData));
        interaction.editReply(`your preferred timezone has been set to ${tz}!`);
    },
}