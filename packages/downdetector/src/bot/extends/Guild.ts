import { Subscribe } from 'database';
import { Structures } from 'discord.js';

declare module 'discord.js' {
    interface Guild {
        getSubscribed(): Promise<Subscribe[]>,
    }
}

export default Structures.extend('Guild', Guild => class extends Guild {
    public getSubscribed(): Promise<Subscribe[]> {
        return Subscribe.find({ relations: ['status'], where: { guild: this.id } });
    }
});
