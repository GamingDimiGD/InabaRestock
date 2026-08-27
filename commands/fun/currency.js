const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("currency")
        .setDescription("Check exchange rates")
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount to convert')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('from')
                .setDescription('The currency to convert from')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('to')
                .setDescription('The currency or currencies to convert to (split with comma if multiple)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const amount = interaction.options.getNumber('amount'),
            from = interaction.options.getString('from').toUpperCase(), to = interaction.options.getString('to').toUpperCase(),
            toArray = to.split(',').map(e => e.trim()).filter(e => e !== from);
        if (from === to) return interaction.reply("You can't convert to the same currency!");
        if (from.length !== 3 || toArray.some(e => e.length !== 3)) return interaction.reply("Invalid currency code! Currency codes must be 3 characters long.");
        await interaction.deferReply();
        if (toArray.length > 10) return interaction.editReply("You can only convert to up to 10 currencies at once.");
        let res = await fetch(`https://api.frankfurter.dev/v2/rates?base=${from}&quotes=${to}`)
        if (!res.ok) return interaction.editReply(`Error: ${res.statusText}`);
        res = await res.json();
        if (res.message) return interaction.editReply(`Error: ${res.message}`);
        if (!res?.length) return interaction.editReply(`Error: Server returned nothing??`);
        const embed = new EmbedBuilder()
            .setTitle(`Exchange rates from ${amount}${from}`)
            .setColor(0x2b2b2b)
            .setDescription(
                res.map(e => `${e.quote}: ${(e.rate * amount).toFixed(3)}`).join('\n')
            )
        interaction.editReply({ embeds: [embed] });
    }
};