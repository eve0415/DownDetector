import { resolve } from 'path';
import { ModuleData, ModuleManager } from './ModuleManager';
import { Command } from '../interfaces';

export class CommandManager extends ModuleManager<string, Command> {
    public register(data: ModuleData<string, Command>): Command {
        console.info(`[CommandManager] Registering command: ${data.key}`);
        return super.register(data);
    }

    public unregister(name: string): Command {
        console.info(`[CommandManager] Unregistering command: ${name}`);
        return super.unregister(name);
    }

    public async registerAll(): Promise<void> {
        console.info('[CommandManager] Trying to register all commands');
        const dir = resolve(`${__dirname}/../commands/`);
        const modules = this.scanModule(dir, /.js|.ts/);
        const result = await Promise.all(modules.map(file => this.loadModule(file)));

        const commands = result.filter<Command>((value): value is Command => value instanceof Command)
            .map<ModuleData<string, Command>>(command => this.toModuleData(command));

        await super.registerAll(commands);
        console.info(`[CommandManager] Successfully registered ${this.size} commands`);
    }

    protected toModuleData(command: Command): ModuleData<string, Command> {
        return {
            key: command.name,
            value: command,
        };
    }
}
