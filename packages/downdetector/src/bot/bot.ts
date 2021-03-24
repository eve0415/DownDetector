import './extends';
import { Client } from 'discord.js';
import { CommandManager, EventManager, StatusMessageManager } from './managers';
import { DownDetector } from '../DownDetector';

export class Bot extends Client {
    public readonly instance: DownDetector;
    private readonly event: EventManager;
    public readonly command: CommandManager;
    public readonly status: StatusMessageManager;

    public constructor(instance: DownDetector) {
        super({
            restTimeOffset: 0,
            intents: ['GUILDS', 'GUILD_MESSAGES'],
        });
        this.instance = instance;
        this.event = new EventManager(this);
        this.command = new CommandManager(this);
        this.status = new StatusMessageManager(this);
    }

    public async start(): Promise<void> {
        await this.init().catch(console.error);
        await this.login().catch(console.error);
    }

    private async init() {
        console.log('[System] Pre Initializing...');
        await Promise.all([
            this.event.registerAll(),
            this.command.registerAll(),
        ]);
        console.log('[System] Pre Initialize complete');
    }
}
