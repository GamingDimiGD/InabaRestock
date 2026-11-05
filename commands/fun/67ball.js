const { SlashCommandBuilder } = require("discord.js");

const responses = [
    // Affirmative
    "on my gf roomba",
    "hell yeah",
    "draggin myself into the hadal abyss zone if that isn't true",
    "perchance, but of course",
    "y to the e to the s",
    "zruth nuke",
    "GREENGREEN",
    "i read the book of truths and this was in it",
    "certifiably",
    "mhm",
    // Negative
    "aw hell nah",
    "my gf will friggin die if this is true",
    "REDRED",
    "same answer as the following: do i have good servers?",
    "i wanna live, wanna live\ndeep inside i've always been\nreaching out for a button\nand that button just says **NO.**",
    "I hereby deny this allegation.",
    "as long as you give me 1 billion doolars",
    "thats what the telescreen would say",
    "not possible",
    "Sodium hypobromite\n-# explanation: NaBrO",
    "nuh uh",
    // Neutral
    "roomba is this true",
    "jyanz knows",
    "i have a gf btw",
    "haha sometimes",
    "i'm just a restock... i don't know... but i do have a gf called roomba !! she's really cute !!",
    "poop",
    "idk ask mudae",
    // Whatever these are
    "why did you ask me this question",
    "double it and give it to the next person",
    "i'm shooting you",
    "behind you",
    "what's the question again? i EATED it 💔💔💔",
    "must've been der wind",
    "I made a severe and continuous lapse in my judgement, and I don’t expect to be forgiven. I’m simply here to apologize.",
    "killing everyone",
    "im also like super gay",
    "\\*hits u with a pipe\\* oh im sorry",
    "question not compact enough, pls try again",
    "love you"
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("67ball")
        .setDescription("Ask the 67ball a question and it will answer you")
        .addStringOption(option =>
            option.setName("question")
                .setDescription("Your question")
                .setRequired(true)
                .setMaxLength(200)
        )
    ,
    async execute(interaction) {
        await interaction.reply(`Q. ${interaction.options.getString("question")}\nA. ${responses[Math.floor(Math.random() * responses.length)]}`);
    }
};