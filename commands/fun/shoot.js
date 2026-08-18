const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shoot")
        .setDescription("Shoot someone")
        .addMentionableOption(option =>
            option.setName("user")
                .setDescription("The user to shoot")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const user = interaction.options.getMentionable('user');
        if (user.id === interaction.client.user.id) return await interaction.reply('you can\'t shoot me lmao, i\'m invincible and nobody can stop me boooo');
        const message = await interaction.reply({
            content: `${interaction.user} has shot ${user}!`, components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('parry')
                        .setLabel('+PARRY')
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        });
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000, filter: i => i.customId === 'parry' && i.user.id === interaction.user.id });
        collector.on('collect', async i => {
            await i.deferUpdate();
            const rng = Math.floor(Math.random() * 10) + 1;
            if (rng > 9) await i.editReply(`${user} has parried ${interaction.user}'s shot!`)
            else await i.editReply(`bro tried to parry a bullet lmao`);
            collector.stop();
        });
        collector.on('end', collected => {
            if (collected.size === 0) {
                console.log('[shoot] th is bro doing why didn\'t bro parry')
            }
        });
    }
};