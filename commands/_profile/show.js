const { SlashCommandSubcommandBuilder, EmbedBuilder } = require("discord.js");

const jsonToEnglish = {
    "favSong": "Favorite Inabakumori song",
    "timezone": "Timezone",
    "color": "Color"
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("show")
        .setDescription("Show your profile")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to show the profile of")
                .setRequired(false)
    ),
    async execute(interaction) {
        await interaction.deferReply().catch(() => {});
        const user = interaction.options.getUser("user") || interaction.user;
        const userData = JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"))[user.id];
        if (!userData) return await interaction.editReply(user.username + " doesn't have a profile yet!");
        const embed = new EmbedBuilder()
            .setTitle(`**${user.username}**'s profile`)
            .setColor(userData.color || 0xb2b2b2)
            .setThumbnail(user.displayAvatarURL({ format: "png" }))
            .setDescription(Object.keys(jsonToEnglish).map(k => `${jsonToEnglish[k]}: ${userData[k] || "N/A"}`).join('\n'));
        return await interaction.editReply({ embeds: [embed] });
    }
}