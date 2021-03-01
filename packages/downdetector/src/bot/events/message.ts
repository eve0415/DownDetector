import { Message } from 'discord.js';
import { Bot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    private readonly prefix = 'dd.';

    public constructor(bot: Bot) {
        super(bot, 'message');
    }

    public run(message: Message): void {
        if (message.author.bot) return;
        if (!this.isCalled(message)) return;

        const mentionStr = new RegExp(`<@!?${this.cleanSnowflake(message.content.split(' ').shift() ?? '')}>`);
        const regex = new RegExp(`${this.prefix}|${mentionStr.source} `);
        const [command, ...args] = message.content.replace(regex, '').split(' ');

        const cmd = this.bot.command.get(command) ?? this.bot.command.find(c => c.alias.includes(command));
        if (!cmd) return;
        if (cmd.guildOnly && !message.guild) message.channel.send('Sorry, you can not use this command in DM');

        cmd.run(message, args);
    }

    private isCalled(message: Message) {
        if (message.content.startsWith(this.prefix)) return true;
        if (message.mentions.users.find(u => this.bot.user === u)) {
            const first = message.content.split(' ').shift();
            if (message.guild?.members.resolve(this.cleanSnowflake(first ?? ''))) return true;
        }
        return false;
    }

    private cleanSnowflake(str: string) {
        return str
            .replace('<', '')
            .replace('@', '')
            .replace('!', '')
            .replace('>', '');
    }
}
