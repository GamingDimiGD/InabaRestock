const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shoot")
        .setDescription("Shoot someone")
        .addUserOption(option =>
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
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000, filter: i => i.customId === 'parry' });
        collector.on('collect', async i => {
            if (i.user.id !== user.id) return await i.reply({ content: 'only the victim can parry bro', ephemeral: true });
            await i.deferUpdate();
            const rng = Math.floor(Math.random() * 10) + 1;
            let content = rng > 9 ? `${user} has parried ${interaction.user}'s bullet!` : `bro tried to parry a bullet lmao`
            await i.editReply({
                content,
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('parry')
                            .setLabel('+PARRY')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    )
                ]
            });
            collector.stop();
        });
        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: `${interaction.user} has shot ${user}!`,
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('parry')
                                .setLabel('too late to parry lmao')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(true)
                        )
                    ]
                });
            }
        });
    }
};