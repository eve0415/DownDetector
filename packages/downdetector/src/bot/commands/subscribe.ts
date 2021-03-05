import { Status, Subscribe } from 'database';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '..';
import { DownDetector } from '../../DownDetector';
import { PresetStatus } from '../../preset';
import { Command } from '../interfaces';

export default class extends Command {
    private readonly instance: DownDetector;

    public constructor(bot: Bot) {
        super(bot, 'subscribe', {
            description: 'Subscribe to notifies you when some services are down!',
            usage: 'subscribe [service name | service ID | list] [channel]',
            alias: ['sub'],
            guildOnly: true,
        });
        this.instance = bot.instance;
    }

    public run(message: Message, args: string[]): Promise<void | Message> {
        if (!args.length) return this.showSubscribed(message);
        if (args.length > 2) return message.channel.send('Too many arguments');
        const channel = args.length === 2 ? this.getChannelFromId(args[1]) : message.channel as TextChannel;
        if (!channel) return message.channel.send('Not channel ID');
        if (args[0] === 'list') return message.channel.send({ embed: { description: PresetStatus.map(p => `**${p.name}** - ${p.id}`).join('\n'), color: 'BLUE' } });
        return this.subscribe(message, args, channel);
    }

    private async showSubscribed(message: Message) {
        const subscribed = await message.guild?.getSubscribed();
        const count = subscribed?.map(s => s.status).reduce((sum, element) => sum.concat(element), []);
        const embed = new MessageEmbed()
            .setTitle(`${count?.length ? `This server is watching ${count?.length} services` : 'This server is not watching any services'}`)
            .setColor('BLUE')
            .setDescription(count?.length
                ? subscribed?.flatMap(subscribe => subscribe.status.map(s => `**${s.name}**(${s.id}) - <#${subscribe.channel}>`))
                : 'Subscribe by sending `dd.sub <service name | service ID> [channel]`');

        message.channel.send(embed);
    }

    private async subscribe(message: Message, args: string[], channel: TextChannel) {
        const status = await this.instance.statusManager.searchStatus(args[0]);
        if (!status) return message.channel.send('Unknown service');
        const subscribe = await channel.getSubscribed();
        if (subscribe.status.find(s => s.id === status.id)) return this.unSubscribe(message, subscribe, status);
        subscribe.status.push(status);
        await subscribe.save();
        message.channel.send('Succesfully subscribed');
    }

    private async unSubscribe(message: Message, subscribe: Subscribe, status: Status) {
        subscribe.status = subscribe.status.filter(s => s.id !== status.id);
        if (subscribe.status.length) {
            await subscribe.save();
        } else {
            await subscribe.remove();
            this.instance.statusManager.removeStatus(status.id);
        }
        message.channel.send('Successfully unsubscribed');
    }

    private getChannelFromId(channel: string) {
        const regex = /<?#?(?<id>\d{17,})>?/;
        const test = regex.exec(channel);
        if (!test) return null;
        const ch = this.bot.channels.resolve(test.groups?.id ?? '');
        return ch?.type === 'text' ? ch as TextChannel : null;
    }
}
