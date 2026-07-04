const { SlashCommandBuilder } = require("@discordjs/builders");
const { AttachmentBuilder } = require("discord.js");
const { ZipArchive } = require('archiver');
const { PassThrough } = require('stream');

const createZipBuffer = async (files) => new Promise((res, rej) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const bufferStream = new PassThrough();
    const buffers = [];
    bufferStream.on('data', (chunk) => buffers.push(chunk));
    bufferStream.on('end', () => res(Buffer.concat(buffers)));
    bufferStream.on('error', rej);
    archive.pipe(bufferStream);

    for (const file of files) {
        archive.file(file, { name: require('path').basename(file) });
    }
    archive.on('warning', console.warn);
    archive.on('error', console.error);
    archive.finalize();
})

module.exports = {
    data: new SlashCommandBuilder()
        .setName("requestbraindata")
        .setDescription("Download a zip file of 4 brain data files")
    ,
    async execute(interaction) {
        await interaction.deferReply();
        const zipBuffer = await createZipBuffer(['./ai/brain.json', './ai/smallBrain.json', './ai/tinyBrain.json', './ai/starterBrain.json']);
        await interaction.editReply(
            {
                content: "download ~~virus~~ brain data",
                files: [new AttachmentBuilder(zipBuffer, { name: 'brains.zip' })]
            });

    }
};