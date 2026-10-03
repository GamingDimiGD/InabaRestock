const { SlashCommandSubcommandBuilder } = require('discord.js'),
    fs = require("fs");

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("color")
        .setDescription("Set your profile's embed color")
        .addStringOption(option =>
            option.setName("hex-code")
                .setDescription("The hex code for the color to set for your profile's embed")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const color = interaction.options.getString('hex-code');
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) return await interaction.editReply("Invalid hex code, please provide a valid hex code (e.g. #FF0000)\n[Color picker](https://www.google.com/search?q=color+picker)");
        if (!fs.existsSync(`./data/users.json`)) fs.writeFileSync(`./data/users.json`, "{}");
        let userData = JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"))
        if (!userData[interaction.user.id]) userData[interaction.user.id] = {};
        userData[interaction.user.id].color = color;
        fs.writeFileSync(`./data/users.json`, JSON.stringify(userData));
        interaction.editReply(`your profile\'s embed color has been set to ${color}!`);
    },
}