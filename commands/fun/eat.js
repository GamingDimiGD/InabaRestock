const { SlashCommandBuilder } = require("discord.js");

const tastinessArray = [
    "so awful that i struggle to even comprehend the fact that i'm eating them. when i was little i always thought school food was the worst food on the big dirt ball called earth",
    'abysmal',
    'horrible',
    'bad',
    'ok',
    'good',
    'great',
    'scrumptious',
    'excellent',
    'magnificent',
    'supercalifragilisticexpialidocious'
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eat")
        .setDescription("eat someone")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to eat")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const tastiness = Math.floor(Math.random() * tastinessArray.length);
        await interaction.reply(`just ate ${user}, they taste ${tastinessArray[tastiness]}, ${tastiness}/${tastinessArray.length - 1}.`);
    }
};