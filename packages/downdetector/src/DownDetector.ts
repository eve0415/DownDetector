import { Database } from 'database';
import { StatusManager } from './StatusManager';
import { Bot } from './bot';

export class DownDetector {
    protected database: Database;
    public statusManager: StatusManager;
    public bot: Bot;

    constructor() {
        this.database = new Database();
        this.statusManager = new StatusManager(this);
        this.bot = new Bot(this);
    }

    public async start(): Promise<void> {
        console.log('Initializing');
        await this.init();
    }

    private async init() {
        await this.database.connect();
        await this.statusManager.init();
        await this.bot.start();
        this.statusManager.postInit();
    }
}

new DownDetector().start();
