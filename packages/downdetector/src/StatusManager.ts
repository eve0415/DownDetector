import { Status } from 'database';
import { Collection } from 'discord.js';
import { getLogger } from 'log4js';
import { IIncident, Incident, Maintenance, Util } from 'statuspageapi';
import { DownDetector } from '.';
import { StatusPage } from './Status';
import { PresetStatus } from './preset';

export class StatusManager extends Collection<string, StatusPage> {
    private readonly logger = getLogger('StatusManager');
    private readonly instance: DownDetector;

    public constructor(instance: DownDetector) {
        super();
        this.instance = instance;
    }

    public async init(): Promise<void> {
        this.logger.info('Initializing');
        const status = await Status.find();
        await Promise.all(status.map(s => this.set(s.id, new StatusPage(s.id).on('statusUpdate', (base, incident) => this.onStatusChange(base, incident)))));
    }

    public postInit(): void {
        this.forEach(s => s.init());
    }

    public async searchStatus(str: string): Promise<Status | null> {
        // Try to retrieve from database
        const fromCache = await Status.findOne({ where: [{ id: str }, { name: str }] });
        if (fromCache) return fromCache;
        // Try to retrieve from presets
        const fromPreset = PresetStatus.find(s => s.id === str || s.name === str);
        if (fromPreset) return new Status({ id: fromPreset.id, name: fromPreset.name }).save();
        // Fallback to fetch from statuspage.io API
        if (await Util.isValidId(str)) {
            const name = await Util.getServiceName(str);
            return new Status({ id: str, name: name }).save();
        }
        // If we can't find from anywhere, return nil
        return null;
    }

    public addStatus(status: Status): void {
        if (this.has(status.id)) return;
        const newStatus = new StatusPage(status.id).on('statusUpdate', (base, incident) => this.onStatusChange(base, incident));
        newStatus.init();
        this.set(status.id, newStatus);
    }

    public async removeStatus(id: string): Promise<void> {
        const status = await Status.findOne({ id: id });
        if (!status?.subscribed.length && this.has(id)) {
            this.get(id)?.clear();
            this.delete(id);
            await status?.remove();
        }
    }

    private onStatusChange(base: Incident | Maintenance, incident: IIncident) {
        this.instance.bot.status.updateStatus(base, incident);
    }
}
