import { Subscribe } from 'database';
import { Guild as CGuild, Structures } from 'discord.js';

declare module 'discord.js' {
    interface Guild {
        getSubscribed(): Promise<Subscribe[]>,
    }
}

export class ExtendedGuild extends CGuild {
    public getSubscribed(): Promise<Subscribe[]> {
        return Subscribe.find({ relations: ['status'], where: { guild: this.id } });
    }
}

export default Structures.extend('Guild', () => ExtendedGuild);
