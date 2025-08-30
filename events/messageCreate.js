const { ChannelType } = require('discord.js');
module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        if (message.channel.type !== ChannelType.DM) return;
        message.client.guilds.cache.get('1410959974842236930').channels.cache.get('1411379565972160562').send(`${message.author.username}: ${message.content}`);
    }
}