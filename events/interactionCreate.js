const { Events, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isButton()) {
			if (interaction.customId === "roll_again") {
				const sides = interaction.message.content.match(/(\d+) sides/)?.[1] || 6;
				const result = Math.floor(Math.random() * sides) + 1;
				await interaction.update({ content: `You rolled a ${result} (${sides} sides)` });
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
				await interaction.followUp({ content: 'stupid error alert', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.followUp({ content: 'stupid error alert', flags: MessageFlags.Ephemeral });
			}
		}
	},
};