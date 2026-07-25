const { Events, MessageFlags, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { pageLength } = require('./messageCreate.js');
const fs = require('fs');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isButton()) {
			if (interaction.customId === "roll_again") {
				const sides = interaction.message.content.match(/(\d+) sides/)?.[1] || 6;
				const result = Math.floor(Math.random() * sides) + 1;
				await interaction.update({ content: `You rolled a ${result} (${sides} sides)` });
			}
		} else if (interaction.isStringSelectMenu()) {
			if (interaction.customId === "playlistPageSelector") {

				const playlist = JSON.parse(fs.readFileSync('./events/playlist.json', 'utf-8'));
				if (Object.keys(playlist).length == 0) return interaction.update({ content: 'playlist is empty.', components: [], embeds: [] });
				const page = parseInt(interaction.values[0]);
				let embed = new EmbedBuilder()
					.setTitle('Event Playlist')
					.setDescription(Object.keys(playlist).splice(pageLength * (page - 1), pageLength).map((url, i) =>
						`${i + 1 + pageLength * (page - 1)}. \`${url}\` (submitted by ${interaction.guild.members.cache.get(playlist[url])?.user?.username || 'unknown user'})`
					).join('\n'))
					.setColor('#b2b2b2')
					.setFooter({ text: `Page ${page}/${Math.ceil(Object.keys(playlist).length / pageLength)}, ${Object.keys(playlist).length} songs` })
					.setTimestamp();
				let pageSelectors = []
				for (let i = 1; i <= Math.ceil(Object.keys(playlist).length / pageLength); i++) {
					pageSelectors.push({
						label: `Page ${i}`,
						value: i.toString()
					})
				}
				const row = new ActionRowBuilder()
					.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('playlistPageSelector')
							.setPlaceholder('Select a page')
							.addOptions(...pageSelectors)
					)
				await interaction.update({ embeds: [embed], components: [row] });
			}
		}
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName) || interaction.client.dimiOnlyCommands.get(interaction.commandName);

		if (!command) {
			console.error(`[Discord] No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			if (command.data.name === interaction.client.dimiOnlyCommands.get(interaction.commandName)?.data.name) {
				console.log('[Discord] Dimi only command executed');
				if (interaction.user.id !== '766856785444864010') {
					console.log('[Discord] Not dimi');
					return await interaction.reply({ content: 'ur not dimi', flags: MessageFlags.Ephemeral });
				} else console.log('[Discord] Is Dimi');
			};
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				interaction.channel.send('```' + error + '```')
				await interaction.followUp({ content: 'stupid error alert', flags: MessageFlags.Ephemeral });
			} else {
				interaction.channel.send('```' + error + '```')
				await interaction.followUp({ content: 'stupid error alert', flags: MessageFlags.Ephemeral });
			}
		}
	},
};