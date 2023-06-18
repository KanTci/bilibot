const { Message, Events } = require('discord.js');
const { getDynamicDetail } = require('../bili/dynamic');
const { getVideoDetail } = require('../bili/video');
const { getRoomDetail } = require('../bili/live');

module.exports = {
    name: Events.MessageCreate,

    /**
     * 
     * @param {Message} message 
     */
    async execute(message) {
        if (message.author.bot) return;

        const dynPattern = /t\.bilibili\.com\/\d+|bilibili\.com\/opus\/\d+/;
        const vidPattern = /((av\d{1,9})|(BV\w{8,10}))(?!\w)/;
        const livePattern = /(?<=live\.bilibili\.com\/)\d{1,8}/;

        if (dynPattern.test(message.content)) {
            await getDynamicDetail(message.content.match(/(?<=bilibili\.com\/(opus\/)?)\d+/)[0])
                .then(embed => {
                    if (embed) message.reply({
                        embeds: embed
                    });
                })
                .catch(error => console.log(error));
        } else if (vidPattern.test(message.content)) {
            const vid = message.content.match(vidPattern)[0];
            let aid = '', bvid = '';
            if (/^av/.test(vid)) aid = vid.slice(2);
            else bvid = vid;
            await getVideoDetail(bvid, aid)
                .then(embed => {
                    if (embed == -403) {
                        message.reply('Error -403: 权限不足');
                    } else if (embed == -404) {
                        message.reply('Error -404: 无视频');
                    } else if (embed == 62002) {
                        message.reply('Error 62002: 稿件不可见');
                    } else if (embed == 62004) {
                        message.reply('Error 62004: 稿件审核中');
                    } else if (typeof embed == 'object') {
                        message.reply({ embeds: [embed] });
                    }
                }).catch(error => console.log(error));
        } else if (livePattern.test(message.content)) {
            const embed = await getRoomDetail(message.content.match(livePattern)[0]);
            if (embed) await message.reply({ embeds: [embed] });
        }
    }
}