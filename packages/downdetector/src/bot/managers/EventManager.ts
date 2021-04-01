import { resolve } from 'path';
import { ModuleData, ModuleManager } from './ModuleManager';
import { Event } from '../interfaces';

export class EventManager extends ModuleManager<string, Event> {
    public register(data: ModuleData<string, Event>): Event {
        const event = data.value;
        this.logger.info(`Registering event: ${event.name}`);
        event.bot.on(event.name, event.bind);
        return super.register(data);
    }

    public unregister(key: string): Event {
        const event = super.unregister(key);
        this.logger.info(`Unregistering event: ${event.name}`);
        event.bot.removeListener(event.name, event.bind);
        return event;
    }

    public async registerAll(): Promise<void> {
        this.logger.info('Trying to register all events');
        const dir = resolve(`${__dirname}/../events`);
        const modules = this.scanModule(dir, /.js|.ts/);
        const result = (await Promise.all(modules.map(file => this.loadModule(file))))
            .filter<Event>((value): value is Event => value instanceof Event)
            .map<ModuleData<string, Event>>(event => this.toModuleData(event));
        await super.registerAll(result);
        this.logger.info(`Successfully registered ${this.size} events`);
    }

    public async unregisterAll(): Promise<void> {
        this.logger.info('Trying to unregister all events');
        await super.unregisterAll();
    }

    protected toModuleData(event: Event): ModuleData<string, Event> {
        return {
            key: event.name,
            value: event,
        };
    }
}
