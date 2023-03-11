import inquirer from "inquirer";
import chalkAnimation from "chalk-animation";
import startBot from "./bot.mjs"
import Database from "st.db";
import replit from "quick.replit"
const config_replit_db = new replit.Database(process.env["REPLIT_DB_URL"])
const config = new Database({ path: "./config.json", databaseInObject: true })
await getStarted()

function clearTextPrompt(str, status_bot = false) {
    return !status_bot ? str.replaceAll("\\", "").replaceAll(" ", "").replaceAll("~", "") : str.replaceAll("\\", "").replaceAll("~", "")
}

async function getStarted() {
    if (await config.get("do_false_this_value_if_you_want_delete_token") != true) {
        await config_replit_db.delete(`token`)
    }
    if (await config_replit_db.has(`token`) == true) return await startBot()
    const rainbow = chalkAnimation.neon('ًﺍﺮﻴﺜﻛ ﺭﺎﻔﻐﺘﺳﻻﺍﻭ ﻪﻠﻟﺍ ﺮﻛﺫ ﻰﺴﻨﺗ ﻻ ﺀﻲﺷ ﻞﻛ ﻞﺒﻗ');
    setTimeout(async () => {
        rainbow.stop()
        console.log(`\u001b[42;1mSuggestion\u001b[0m Bot \nBy \u001b[47;1m\u001b[32;1mMr.Tom#0001\u001b[0m `)
        const ask1 = await inquirer.prompt({
            name: "token_bot",
            type: 'password',
            message: `Put your Bot token :`,
            mask: "*"
        })
        const ask2 = await inquirer.prompt({
            name: "status_bot",
            type: 'input',
            message: `Type in the status of the bot you want :`,
        })
        const ask3 = await inquirer.prompt({
            name: "status_type",
            type: 'list',
            message: `Choose the type of bot status :`,
            choices: [
                "PLAYING", "LISTENING", "WATCHING", "COMPETING"
            ]
        })
        const ask4 = await inquirer.prompt({
            name: "channelVoiceId",
            type: 'input',
            message: `Set the channel id through which the member will enter to create a temporary channel :`,
        })
        const ask5 = await inquirer.prompt({
            name: "categoryId",
            type: 'input',
            message: `Put a category id in which temporary channels will be created :`,
        })
        const ask6 = await inquirer.prompt({
            name: "prefix",
            type: 'input',
            message: `Set the bot prefix :`,
        })
        await config_replit_db.set(`token`, clearTextPrompt(ask1.token_bot))
        await config.set("category", {ID:clearTextPrompt(ask5.categoryId)})
        await config.set("channelVoice", {ID:clearTextPrompt(ask4.channelVoiceId)})
        await config.set("status_type", clearTextPrompt(ask3.status_type))
        await config.set("status_bot", clearTextPrompt(ask2.status_bot, true))
        await config.set("do_false_this_value_if_you_want_delete_token", true)
        await config.set("prefix", clearTextPrompt(ask6.prefix))
        return await startBot()
    }, 3460)
}
