const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"),
    lengthUnits = [
        { name: "meter", symbol: "m", multiplyFactor: 1 },
        { name: "centimeter", symbol: "cm", multiplyFactor: 100 },
        { name: "millimeter", symbol: "mm", multiplyFactor: 1000 },
        { name: "kilometer", symbol: "km", multiplyFactor: 0.001 },
        { name: "inch", symbol: "in", multiplyFactor: 1/1609*63360 },
        { name: "foot", symbol: "ft", multiplyFactor: 1/1609*5280 },
        { name: "yard", symbol: "yd", multiplyFactor: 1/1609*1760 },
        { name: "mile", symbol: "mi", multiplyFactor: 1/1609 }
    ],
    weightUnits = [
        { name: "gram", symbol: "g", multiplyFactor: 1 },
        { name: "kilogram", symbol: "kg", multiplyFactor: 0.001 },
        { name: "ounce", symbol: "oz", multiplyFactor: 1/28.35 },
        { name: "pound", symbol: "lb", multiplyFactor: 1/453.6 }
    ],
    volumeUnits = [
        { name: "liter", symbol: "L", multiplyFactor: 1 },
        { name: "milliliter", symbol: "mL", multiplyFactor: 1000 },
        { name: "US gallon", symbol: "gal", multiplyFactor: 1/3.78541 },
        { name: "US quart", symbol: "qt", multiplyFactor: 1/3.78541*4 },
        { name: "US pint", symbol: "pt", multiplyFactor: 1/3.78541*8 },
        { name: "US cup", symbol: "cup", multiplyFactor: 1/0.24 }
    ]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unit")
        .setDescription("Converts units")
        .addStringOption(option =>
            option.setName("number")
                .setDescription("The number of the unit")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("from")
                .setDescription("The unit to convert from")
                .setRequired(true)
                .addChoices(
                    ...[...lengthUnits, ...weightUnits, ...volumeUnits].map(unit => { return { name: unit.name, value: unit.name } })
                )
        )
    ,
    async execute(interaction) {
        const number = parseFloat(interaction.options.getString('number'))
        if (isNaN(number)) return await interaction.reply(`invalid number ${interaction.options.getString('number')}`);
        const fromUnit = [...lengthUnits, ...weightUnits, ...volumeUnits].find(unit => unit.name === interaction.options.getString('from'));
        if (!fromUnit) return await interaction.reply(`invalid unit ${interaction.options.getString('from')}`);
        const unitType = lengthUnits.some(unit => unit.name === fromUnit.name) ? "length" : weightUnits.some(unit => unit.name === fromUnit.name) ? "weight" : "volume";
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${number}${fromUnit.symbol} is...`)
                    .setDescription((
                        (unitType === "length" ? lengthUnits : unitType === "weight" ? weightUnits : volumeUnits)
                            .map(unit => {
                                if (unit.name === fromUnit.name) return `${number}${unit.symbol}`
                                if (unit.multiplyFactor) return `${parseFloat((number * unit.multiplyFactor / fromUnit.multiplyFactor).toFixed(5))}${unit.symbol}`
                            })
                            .join("\n")
                    ))
                    .setFooter({ text: `Unit type: ${unitType}` })
            ]
        })
    }
};