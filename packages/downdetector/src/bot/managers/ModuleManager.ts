import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Collection } from 'discord.js';
import { Bot } from '..';

export type ModuleData<K, V> = Readonly<{
    key: K,
    value: V
}>;

export abstract class ModuleManager<K, V> extends Collection<K, V> {
    protected readonly bot: Bot;

    public constructor(bot: Bot) {
        super();
        this.bot = bot;
    }

    public register(data: ModuleData<K, V>): V {
        if (this.has(data.key)) console.error(`Failed to register ${data.key} `, `${data.key} is used`);
        this.set(data.key, data.value);

        return data.value;
    }

    public unregister(key: K): V {
        const value = this.get(key) as V;
        if (!value || !this.has(key)) console.error(`Failed to unregister ${key} `, `${key} does not exist.`);
        this.delete(key);
        return value;
    }

    public registerAll(data: ModuleData<K, V>[]): Promise<unknown> {
        return Promise.all(data.map(value => this.register(value)));
    }

    public unregisterAll(): Promise<unknown> {
        return Promise.all(this.keyArray().map(key => this.unregister(key)));
    }

    protected scanModule(dir: string, pattern: RegExp): string[] {
        const files: string[] = [];
        const dirents = readdirSync(dir, { withFileTypes: true });
        dirents.filter(d => d.isFile()).map(({ name }) => files.push(resolve(dir, name)));
        const filesInFolders = dirents.filter(d => d.isDirectory()).map(({ name }) => this.scanModule(resolve(dir, name), pattern));
        filesInFolders.map(folders => folders.map(f => files.push(f)));
        return files.filter(file => pattern.exec(file));
    }

    protected async loadModule(absolutePath: string): Promise<unknown> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return create((await import(absolutePath)).default, this.bot);
        } catch (e) {
            return new Error(e);
        }
    }

    protected abstract toModuleData(value: unknown): ModuleData<string, unknown>;
}

class A {}
type Type<T> = new (...args: unknown[]) => T;
const create = (ctor: Type<A>, bot: Bot): A => new ctor(bot);
