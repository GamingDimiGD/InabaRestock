const { Events, MessageFlags, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { pageLength } = require('./messageCreate.js');
const fs = require('fs');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		try {
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
						.setDescription((
							await Promise.all(
								Object.keys(playlist)
									.splice(pageLength * (page - 1), pageLength)
									.map(async (url, i) => {
										const member =
											interaction.guild.members.cache.get(playlist[url]) ??
											await interaction.guild.members.fetch(playlist[url]).catch(() => null);

										return `${i + 1 + pageLength * (page - 1)}. \`${url}\` (submitted by ${member?.user?.username ?? 'unknown user'})`;
									})
							)
						).join('\n'))
						.setColor('#b2b2b2')
						.setFooter({ text: `Page ${page}/${Math.ceil(Object.keys(playlist).length / pageLength)}, ${Object.keys(playlist).length} songs` })
						.setTimestamp();
					const row = new ActionRowBuilder()
						.addComponents(
							new StringSelectMenuBuilder()
								.setCustomId('playlistPageSelector')
								.setPlaceholder('Select a page')
								.addOptions(Array.from({ length: Math.ceil(Object.keys(playlist).length / pageLength) }, (_, i) => ({ label: `Page ${i + 1}`, value: `${i + 1}` })))
						)
					await interaction.update({ embeds: [embed], components: [row] });
				} else if (interaction.customId === "autoresponsePageSelector") {
					let page = parseInt(interaction.values[0]);
					const autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf-8'));
					const responses = autoResponseServers[interaction.guild.id].responses;
					const entries = responses.map((response, index) =>
						`**${index + 1}.** \`${response.triggers.join('`, `')}\` => ${response.response}\n-# Type: \`${response.type}\``
					);
					const pages = [];
					let currentPage = '';

					for (const entry of entries) {
						if (currentPage.length + entry.length + 2 > 1000) {
							pages.push(currentPage);
							currentPage = entry;
						} else {
							currentPage += (currentPage ? '\n' : '') + entry;
						}
					}

					if (currentPage) pages.push(currentPage);

					let embed = new EmbedBuilder()
						.setTitle('Autoresponses for this server')
						.setColor('#b2b2b2')
						.setDescription(pages[page - 1])
						.setFooter({ text: `Page 1 of ${pages.length} | ${responses.length} autoresponses` });

					const row = new ActionRowBuilder()
						.addComponents(
							new StringSelectMenuBuilder()
								.setCustomId('autoresponsePageSelector')
								.setPlaceholder('Select a page')
								.addOptions(
									Array.from({ length: pages.length }, (_, i) => ({ label: `Page ${i + 1}`, value: `${i + 1}` }))
								)
						)
					await interaction.update({ embeds: [embed], components: [row] }).catch(async e => {
						console.log(e);
						if (e.code === 50035) return await interaction.reply('bro ur autoresponses are too long i cant list it properly');
						await interaction.reply('error lol');
					});
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
		} catch (error) {
			if (error.code === 10062) {
				console.log("[Discord] Interaction expired or already acknowledged.");
				interaction.user.send('no no dont use that dropdown its broken and it\'s discord\'s fault').catch(err => console.log(err));
				return;
			}
			console.error(error);
		}
	},
};