import { Status } from 'database';
import { Collection } from 'discord.js';
import { Util } from 'statuspageapi';
import { StatusPage } from './Status';
import { PresetStatus } from './preset';

export class StatusManager extends Collection<string, StatusPage> {
    public async init(): Promise<void> {
        const status = await Status.find();
        await Promise.all(status.map(s => this.set(s.id, new StatusPage(s.id))));
    }

    public async isCachedStatus(str: string): Promise<boolean> {
        // Try to retrieve from database or presets
        return !!(await Status.findOne({ id: str })
            ?? await Status.findOne({ name: str })
            ?? PresetStatus.find(s => s.id === str || s.name === str));
    }

    public async searchStatus(str: string): Promise<Status | null> {
        // Try to retrieve from database
        const fromCache = await Status.findOne({ relations: ['subscribed'], where: [{ id: str }, { name: str }] });
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
}
