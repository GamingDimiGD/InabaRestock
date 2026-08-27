const { SlashCommandBuilder, InteractionContextType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("temperature")
        .setDescription("Converts temperatures into each other")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel,
            InteractionContextType.BotDM
        )
        .addStringOption(option =>
            option.setName("number")
                .setDescription("The number of the unit")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('from')
                .setDescription('The unit to convert from')
                .setRequired(true)
                .addChoices(
                    { name: 'Celsius', value: 'C' },
                    { name: 'Fahrenheit', value: 'F' },
                    { name: 'Kelvin', value: 'K' }
                )
        )
    ,
    async execute(interaction) {
        const number = parseFloat(interaction.options.getString('number'));
        if (isNaN(number)) return await interaction.reply(`invalid number ${interaction.options.getString('number')}`);
        const fromUnit = interaction.options.getString('from');
        const celsius = fromUnit === 'C' ? number : fromUnit === 'F' ? (number - 32) * (5 / 9) : (number - 273.15);
        const fahrenheit = fromUnit === 'F' ? number : fromUnit === 'C' ? celsius * (9 / 5) + 32 : celsius * (9 / 5) + 32 + 273.15;
        const kelvin = fromUnit === 'K' ? number : fromUnit === 'C' ? celsius + 273.15 : celsius + 273.15;
        await interaction.reply(`Celsius: ${celsius.toFixed(2)}°C\nFahrenheit: ${fahrenheit.toFixed(2)}°F\nKelvin: ${kelvin.toFixed(2)}K`);
    }
};