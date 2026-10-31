const { SlashCommandSubcommandBuilder } = require('discord.js'),
    fs = require("fs")

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("timezone")
        .setDescription("Set your prefered timezone")
        .addStringOption(option =>
            option.setName("tz")
                .setDescription("The timezone code thingy to set")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const tz = interaction.options.getString('tz');
        let time;
        try {
            time = Intl.DateTimeFormat('en-US', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' }).format(new Date());
        } catch (e) {
            return await interaction.editReply("Invalid timezone");
        }
        if (!fs.existsSync(`./data/users.json`)) fs.writeFileSync(`./data/users.json`, "{}");
        let userData = JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"))
        if (!userData[interaction.user.id]) userData[interaction.user.id] = {};
        userData[interaction.user.id].timezone = tz;
        fs.writeFileSync(`./data/users.json`, JSON.stringify(userData));
        interaction.editReply(`your preferred timezone has been set to ${tz}!\nYour current time is: ${time}`);
    },
}