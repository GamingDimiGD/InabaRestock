const cheerio = require("cheerio");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require('dotenv').config(),
    fs = require('fs'),
    path = require('path');
module.exports.checkDuration = 1.5 * 36e5
const itemData = fs.existsSync(path.join(__dirname, 'cache', 'checkData.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'cache', 'checkData.json'), "utf-8")) : { allItemsCache: [], lastCheck: 0 };

const getItems = async (shopSubdomain = "inabakumori", pageNum = [1, 2]) => {
    const allItems = [];
    console.log('[getItems] requested...');
    try {
        const selector = '.item, .item *'
        for (n of pageNum) {
            console.log('[getItems] fetching page: ' + n);
            const data = await fetch(
                `https://api.scrapingant.com/v2/general?x-api-key=${process.env.SCRAPINGANT_KEY}&url=${encodeURIComponent(`https://${shopSubdomain}.booth.pm/items?page=${n}`)}&render=true&wait_for_selector=${encodeURIComponent(selector)}`)
                .then(response => response.text())
                .catch(error => {
                    console.log(error)
                });
            console.log('[getItems] parsed page ' + n);
            const $ = cheerio.load(data);
            const items = $(".item");
            if (!items.length) {
                console.warn("[getItems] No items found on page " + n + ", what a waste");
            }
            if ($('h1').text() === "メンテナンス中です" || $('span.not-found-girl').length > 0) {
                console.warn("[getItems] Outage detected, aborting all pages.");
                break;
            }
            for (let item of items) {
                const name = $(item).find("a.item-card__title-anchor--multiline.whitespace-normal").text();
                const soldOut = $(item).find(".shop__text--contents").length > 0;
                allItems.push({ name, soldOut });
            }
            console.log('[getItems] finish parsing page ' + n);
            if (items.length < 12) break;
        }
    } catch (error) {
        console.error("[getItems] " + error);
    } finally {
        console.log('[getItems] Logged timestamp: ' + Date.now())
        console.log('[getItems] Logged time: ' + new Date())
    }
    if (shopSubdomain === "inabakumori" && pageNum.length === 2 && allItems.length >= 21) {
        if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });
        const final = {
            allItemsCache: allItems,
            lastCheck: Date.now()
        }
        fs.writeFileSync(path.join(__dirname, 'cache', 'checkData.json'), JSON.stringify(final));
        itemData.allItemsCache = allItems;
        itemData.lastCheck = Date.now();
    }
    return allItems;
}

module.exports.getItems = getItems;

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

module.exports.client = client
client.commands = new Collection();
client.dimiOnlyCommands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const commands = [], dimiOnlyCommands = [];

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            if (folder === "dimi only") {
                dimiOnlyCommands.push(command.data.toJSON());
                client.dimiOnlyCommands.set(command.data.name, command);
            } else {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
            }
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

module.exports.commands = commands;
module.exports.dimiOnlyCommands = dimiOnlyCommands;

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

const express = require('express');

const app = express();
const PORT = process.env.PORT || 13391;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    handler: (req, res) => {
        res.status(429).json({ message: "get rate limited lmao" });
    }
});
app.use(limiter);

app.get('/api/checkData', (req, res) => {
    res.json(itemData);
});

client.login(process.env.TOKEN);