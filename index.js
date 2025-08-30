const puppeteer = require("puppeteer");

const getItems = async (shopSubdomain = "inabakumori", pageNum = [1, 2]) => {
    const allItems = [];
    const browser = await puppeteer.launch({ headless: true, executablePath: '' });
    try {
        for (n of pageNum) {
            const page = await browser.newPage();
            await page.goto(`https://${shopSubdomain}.booth.pm/items?page=${n}`, { waitUntil: "networkidle2" });
            console.log('page ' + n + ' loaded...')
            await page.waitForSelector(".item a.item-card__title-anchor--multiline.whitespace-normal");
            console.log('items loaded...')
            const items = await page.$$eval(".item", els =>
                els.map(el => {
                    const name = el.querySelector("a.item-card__title-anchor--multiline.whitespace-normal")?.textContent;
                    const soldOut = el.querySelector(".shop__text--contents")?.textContent;
                    return { name, soldOut };
                })
            );
            console.log('items parsed...')
        
            items.forEach(item => {
                allItems.push(item);
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
        console.log('successfully closed browser...')
    }
    
    return allItems;
}

module.exports.getItems = getItems

require('dotenv').config();

const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js'),
    fs = require('fs'),
    path = require('path');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const commands = [];

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const rest = new REST().setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, '1331970479262793820'),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

client.login(process.env.TOKEN);