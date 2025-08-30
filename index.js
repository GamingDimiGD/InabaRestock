const cheerio = require("cheerio");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const getItems = async (shopSubdomain = "inabakumori", pageNum = [1, 2]) => {
    const allItems = [];
    console.log('[getItems] requested...');
    try {
        for (n of pageNum) {
            console.log('[getItems] fetching page: ' + n);
            const data = await fetch(`https://api.scraperapi.com/?api_key=${process.env.SCRAPER_API}&url=https%3A%2F%2F${shopSubdomain}.booth.pm%2Fitems%3Fpage%3D${n}&render=true&wait_for_selector=.item`)
                .then(response => response.text())
                .catch(error => {
                    console.log(error)
                });
            console.log('[getItems] parsed page ' + n);
            const $ = cheerio.load(data);
            const items = $(".item");
            for (item of items) {
                const name = $(item).find("a.item-card__title-anchor--multiline.whitespace-normal").text();
                const soldOut = $(item).find(".shop__text--contents").length > 0;
                allItems.push({ name, soldOut });
            }
            console.log('[getItems] finish parsing page ' + n);
        }
    } catch (error) {
        console.error("[getItems] " + error);
    } finally {
        console.log('[getItems] nice, spent 20 FRIGGIN CREDITS FOR THIS STUPID AHH SITE RAAAHHH')
    }

    return allItems;
}

module.exports.getItems = getItems

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

module.exports.commands = commands

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


client.login(process.env.TOKEN);