import { Client, MessageButton, MessageActionRow, MessageSelectMenu, TextInputComponent, Modal } from 'discord.js';
import { createSpinner } from "nanospinner";
import startBot from "./bot.mjs"
import Database from "st.db";
import express from 'express';
const app = express()
import replit from "quick.replit"
const config_replit_db = new replit.Database(process.env["REPLIT_DB_URL"])
const config = new Database({ path: "./config.json", databaseInObject: true })
const temp_channels_db = new Database({ path: "./temp_channels.json" })

export default async function () {
    console.clear()
    const spinner = createSpinner(`Bot processing by \u001b[32;1mMr.Tom#0001\u001b[0m`).start({ color: 'green' })
    const client = new Client({ intents: 32767 })
    const token = await config_replit_db.get(`token`)
    client.login(token).then(() => {
        spinner.update({ text: 'Running the bot...' })
    }).catch(() => {
        spinner.error({ text: 'Invalid Bot Token' })
    })
    client.on("ready", async () => {
        let bot_invite_link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`
        spinner.success({ text: `Logged in as ${client.user.tag} (${client.user.id})` })
        app.get('/', (r, s) => {
            s.send({ message: "Bot by Shuruhatik#2443", youtube_channel: "https://www.youtube.com/channel/UC0gcnat5MeqBR3Uv7UU5Z9w" })
        }).post('/', async (r, s) => {
            s.send({
                message: "Bot by Mr.Tom#0001", youtube_channel: "https://www.youtube.com/channel/UC0gcnat5MeqBR3Uv7UU5Z9w"
            })
            if (await config_replit_db.has(`uptime`) != true) {
                console.log("\u001b[32m✔ \u001b[0mUptime has been done successfully")
                await config_replit_db.set(`uptime`, true)
            }
        })
            .get("/invite", (req, res) => res.status(301).redirect(bot_invite_link))
            .listen(3000)
        console.log("\u001b[32m▣\u001b[0m \u001b[0mBot Run By \u001b[34;1mMr.Tom#0001\u001b[0m")
        console.log("\u001b[32m▣ \u001b[0m\u001b[0m\u001b[40;1m\u001b[34;1mhttps://" + process.env.REPL_ID + ".id.repl.co/invite\u001b[0m")
    })

    client.on("messageCreate", async message => {
        if (message.author.bot || !message.guild) return;
        if (message.content.startsWith(config.get("prefix") + "send")) {
            if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply(":x: ليس لديك إذن لاستخدام هذا الأمر!");
            let args = message.content.split(" ");
            let embeds = [{
                author: { name: "اعدادات الرومات المؤقتة", icon_url: message.guild.iconURL() },
                description: `قم بالضغط على الزر للتحكم بالروم الخاص بك:`,
                image: {
                    url: message.attachments.first()?.url
                },
                color: 0x2F3136
            }]
            let MessageSelectMenuOptions = []
            config.get("voiceLimits").forEach(num => {
                MessageSelectMenuOptions.push({ label: `${num == 0 ? "No Limit" : num}`, value: `${num}` })
            })
            let row1 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`temp_public_${Date.now()}`)
                        .setStyle('SECONDARY')
                        .setEmoji(config.get("emojis").public)
                        .setLabel("عام"),
                    new MessageButton()
                        .setCustomId(`temp_private_${Date.now()}`)
                        .setStyle('SECONDARY')
                        .setEmoji(config.get("emojis").private)
                        .setLabel("خاص"),
                    new MessageButton()
                        .setCustomId(`temp_unmute_${Date.now()}`)
                        .setStyle('SECONDARY')
                        .setEmoji(config.get("emojis").unmute)
                        .setLabel("فك كتم الصوت"),
                    new MessageButton()
                        .setCustomId(`temp_mute_${Date.now()}`)
                        .setStyle('SECONDARY')
                        .setEmoji(config.get("emojis").mute)
                        .setLabel("كتم الصوت"),
                    new MessageButton()
                        .setCustomId(`temp_rename_${Date.now()}`)
                        .setStyle('SECONDARY')
                        .setEmoji(config.get("emojis").rename)
                        .setLabel("تغير الاسم"),
                );
            let row2 = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('temp_limit_' + Date.now())
                        .setPlaceholder('عدد الاعضاء الذين يمكنهم الدخول')
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(MessageSelectMenuOptions),
                );
            message.channel.send({ embeds, components: [row1, row2] }).then(() => {
                message.delete().catch(() => { })
            })
        }
    });

    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (newState.channelId !== null && newState.channelId == config.get("channelVoice").ID) {
            newState.guild.channels.create(newState.member.user.username, {
                permissionOverwrites: [{
                    id: newState.member.id,
                    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'MANAGE_CHANNELS'],
                }, {
                    id: newState.guild.id,
                    deny: ['SEND_MESSAGES'],
                }], parent: config.get("category").ID, type: 2, reason: 'Temp channel Bot by Shuruhatik#2443'
            }).then(async (channeltemp) => {
                await newState.setChannel(channeltemp, 'Temp channel Bot by Shuruhatik#2443');
                await temp_channels_db.set(channeltemp.id, newState.member.id);
            })
                .catch(console.error);
        }
        if (oldState.channelId !== null && temp_channels_db.has(oldState.channelId)) {
            if (oldState.channel.members.filter(x => !x.user.bot).size == 0) {
                let channel = oldState.guild.channels.cache.get(oldState.channelId);
                await channel.delete();
                await temp_channels_db.delete(oldState.channelId);
            }
        }
    })

    client.on("interactionCreate", async interaction => {
        if (interaction.isSelectMenu()) {
            if (interaction.customId.startsWith("temp_limit")) {
                if (interaction.member.voice.channelId == null || interaction.member.voice.channelId !== null && !temp_channels_db.has(interaction.member.voice.channelId)) return await interaction.reply({ content: "انت لا تمتلك روم مؤقت :x:", ephemeral: true })
                if (!interaction.member.voice.channel.permissionsFor(interaction.member).has("MANAGE_CHANNELS")) return await interaction.reply({ content: "انت لا تمتلك صلاحية للتحكم بالروم المؤقت :x:", ephemeral: true })
                await interaction.deferReply({ ephemeral: true })
                await interaction.member.voice.channel.setUserLimit(+interaction.values[0]).catch(console.error)
                await interaction.editReply({
                    embeds: [{
                        title: "تم تنفيذ طلبك بنجاح ✅",
                        fields: [{ name: "الروم المحدد", value: `<#${interaction.member.voice.channelId}>` }],
                        color: 0x2F3136,
                        timestamp: new Date()
                    }], ephemeral: true
                })

            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith("temp_rename")) {
                await interaction.reply({
                    ephemeral: true, embeds: [{
                        title: "برجاء الانتظار.",
                        description: `يتم تغير اسم الروم الخاص بك.`,
                        fields: [{ name: "ملاحظة:", value: "تحذير ، إذا كررت هذا أكثر من مرتين ، فستتلقى حد الاقصي المستحق لك من ديسكورد ، لذلك عليك الانتظار لمدة 10 دقائق." }],
                        color: 0x2F3136
                    }]
                })
                let guild = await client.guilds.fetch(interaction.guildId)
                let channel = await guild.channels.cache.get(interaction.customId.split("_")[2]);
                await channel.edit({
                    name: interaction.fields.getTextInputValue('new_name'),
                }).catch(console.error)
                await interaction.editReply({
                    embeds: [{
                        title: "تم تنفيذ طلبك بنجاح ✅",
                        fields: [{ name: "الروم المحدد", value: `<#${interaction.member.voice.channelId}>` }],
                        color: 0x2F3136,
                        timestamp: new Date()
                    }], ephemeral: true
                })
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId.startsWith("temp")) {
                if (interaction.member.voice.channelId == null || interaction.member.voice.channelId !== null && !temp_channels_db.has(interaction.member.voice.channelId)) return await interaction.reply({ content: "انت لا تمتلك روم مؤقت :x:", ephemeral: true })
                if (!interaction.member.voice.channel.permissionsFor(interaction.member).has("MANAGE_CHANNELS")) return await interaction.reply({ content: "انت لا تمتلك صلاحية للتحكم بالروم المؤقت :x:", ephemeral: true })
                if (interaction.customId.split("_")[1] == "rename") {
                    const modal = new Modal()
                        .setCustomId('temp_rename_' + interaction.member.voice.channelId + '_' + Date.now())
                        .setTitle('إعادة تسمية الروم المؤقت')
                        .addComponents(
                            new MessageActionRow()
                                .addComponents(new TextInputComponent()
                                    .setCustomId("new_name")
                                    .setMaxLength(40)
                                    .setMinLength(2)
                                    .setLabel("الاسم الجديد")
                                    .setPlaceholder("الاسم القديم : " + interaction.member.voice.channel.name)
                                    .setStyle('SHORT'))
                        );
                    await interaction.showModal(modal);
                } else {
                    await interaction.deferReply({ ephemeral: true })
                    if (interaction.customId.split("_")[1] == "private") {
                        await interaction.member.voice.channel.permissionOverwrites.edit(interaction.guild.id, {
                            VIEW_CHANNEL: false
                        }).catch(() => { });
                    } else if (interaction.customId.split("_")[1] == "public") {
                        await interaction.member.voice.channel.permissionOverwrites.edit(interaction.guild.id, {
                            VIEW_CHANNEL: true
                        }).catch(() => { });
                    } else if (interaction.customId.split("_")[1] == "unmute") {
                        await interaction.member.voice.channel.permissionOverwrites.edit(interaction.guild.id, {
                            SPEAK: true
                        }).catch(() => { });
                    } else if (interaction.customId.split("_")[1] == "mute") {
                        await interaction.member.voice.channel.permissionOverwrites.edit(interaction.guild.id, {
                            SPEAK: false
                        }).catch(() => { });
                    }
                    await interaction.editReply({
                        embeds: [{
                            title: "تم تنفيذ طلبك بنجاح ✅",
                            fields: [{ name: "الروم المحدد", value: `<#${interaction.member.voice.channelId}>` }],
                            color: 0x2F3136,
                            timestamp: new Date()
                        }], ephemeral: true
                    })
                }
            }
        }
    })
}
