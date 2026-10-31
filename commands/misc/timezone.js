const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timezone")
        .setDescription("Get timezone from country or city")
        .addStringOption(option =>
            option.setName("tz")
                .setDescription("Timezone code, e.g. Asia/Taipei, +08 or CST")
                .setRequired(false)
    )
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to get the timezone of. You can set yours with /profile timezone")
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        if (!interaction.options.getString("tz") && !interaction.options.getUser("user")) return await interaction.reply("Please provide a timezone or a user");
        const user = interaction.options.getUser("user"), { timezone } = user ? JSON.parse(fs.readFileSync(`./data/users.json`, "utf-8"))[user.id] || {} : {};
        let time;
        try {
            time = Intl.DateTimeFormat('en-US', { timeZone: timezone || interaction.options.getString('tz'), dateStyle: 'full', timeStyle: 'long' }).format(new Date());
        } catch (e) {
            return await interaction.reply("Invalid timezone");
        }
        await interaction.reply(time);
    }
};