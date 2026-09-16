const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js"),
    fs = require("fs"),
    fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
let lastBoil = 0;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("salt")
        .setDescription("Salt a user's PFP")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to salt")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const { boilCD: commandCooldown, boilURL } = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        if (!boilURL) return await interaction.reply('boil url is not set in `config.json`, pls tell dimi about this');
        if (!interaction.options.getUser('user')) return await interaction.reply('invite me to this server pls otherwise the command won\'t work for some reason');
        let pfp = interaction.options.getUser('user').displayAvatarURL({ format: 'png' });
        if (!pfp) return await interaction.reply('user not found!');
        if (pfp.endsWith('.webp')) pfp = pfp.replace('.webp', '.png');
        if (Date.now() - lastBoil < commandCooldown) return await interaction.reply('i need a break bro my cpu\'s getting fried, i\'ll be back <t:' + Math.floor((lastBoil + commandCooldown) / 1e3) + ':R>');
        lastBoil = Date.now();
        await interaction.reply('hold on a sec, im salting...');
        console.log('[boil] Boiling ' + pfp);
        const res = await fetch(`https://${boilURL}/api/salt?avatarlink=${encodeURIComponent(pfp)}&key=${process.env.API_KEY}`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        })
        if (!res.ok) { 
            console.log('[salt] Error: ' + res.statusText);
            return await interaction.editReply(`Error: \`\`\`${res.statusText}\`\`\``);
        }
        await interaction.editReply({
            content: `salted <@${interaction.options.getUser('user').id}>!`,
            files: [new AttachmentBuilder(res.body, { name: 'salt.mp4' })]
        });
    }
};