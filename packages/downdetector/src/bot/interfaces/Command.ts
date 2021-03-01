import { Message } from 'discord.js';
import { Base } from '.';
import { Bot } from '..';

type CommandOptions = Readonly<{
    alias?: string[]
    description: string
    usage: string
    guildOnly?: boolean
    ownerOnly?: boolean
}>;

export type Arguments = Readonly<{
    key: string
    value: []
}>;

export abstract class Command extends Base {
    public readonly alias: string[];
    public readonly description: string;
    public readonly usage: string;
    public readonly guildOnly: boolean;
    public readonly ownerOnly: boolean;

    public constructor(bot: Bot, name: string, options: CommandOptions) {
        super(bot, name);

        this.alias = options.alias ?? [];
        this.description = options.description;
        this.usage = options.usage;
        this.guildOnly = options?.ownerOnly ?? false;
        this.ownerOnly = options?.ownerOnly ?? false;
    }

    public abstract run(message: Message, args: string[]): void;
}
