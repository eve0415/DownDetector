import { Database } from 'database';
import { StatusManager } from './StatusManager';
import { Bot } from './bot';

export class DownDetector {
    protected database: Database;
    public statusManager: StatusManager;
    protected bot: Bot;

    constructor() {
        this.database = new Database();
        this.statusManager = new StatusManager();
        this.bot = new Bot(this);
    }

    public async start(): Promise<void> {
        console.log('Initializing');
        await this.init();
    }

    private async init() {
        await this.database.connect();
        await Promise.all([
            this.statusManager.init(),
            this.bot.start(),
        ]);
    }
}

new DownDetector().start();
