import { Message, MessageEmbed, PermissionResolvable, TextChannel } from 'discord.js';
import { Base } from '.';
import { Bot } from '..';

type CommandOptions = Readonly<{
    alias?: string[]
    description: string
    usage: string
    requiredPerm?: PermissionResolvable
    guildOnly?: boolean
    ownerOnly?: boolean
}>;

export abstract class Command extends Base {
    public readonly alias: string[];
    public readonly description: string;
    public readonly usage: string;
    public readonly requiredPerm: PermissionResolvable;
    public readonly guildOnly: boolean;
    public readonly ownerOnly: boolean;

    public constructor(bot: Bot, name: string, options: CommandOptions) {
        super(bot, name);

        this.alias = options.alias ?? [];
        this.description = options.description;
        this.usage = options.usage;
        this.requiredPerm = options.requiredPerm ?? ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'];
        this.guildOnly = options?.ownerOnly ?? false;
        this.ownerOnly = options?.ownerOnly ?? false;
    }

    public abstract run(message: Message, args: string[]): void;

    protected hasPermission(channel: TextChannel): boolean {
        const hasPerms = channel.permissionsFor(this.bot.user ?? '');
        if (!hasPerms?.has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return false;
        if (!hasPerms?.has(this.requiredPerm)) {
            if (!hasPerms.has('EMBED_LINKS')) {
                channel.send(`Please give proper permissions to ${this.bot.user?.toString()}.\nYou have to give at least \`View Channel\`, \`Send Messages\` and \`Embed Links\``);
            } else {
                const embed = new MessageEmbed()
                    .setTitle('No permission')
                    .setDescription('No description given')
                    .setColor('RED');
                channel.send(embed);
            }
            return false;
        }
        return true;
    }
}
