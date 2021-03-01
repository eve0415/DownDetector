import 'reflect-metadata';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export class Database {
    public async connect(): Promise<Connection> {
        const connectionOptions = await getConnectionOptions();
        Object.assign(connectionOptions, { entities: [`${__dirname}/entities/*.ts`, `${__dirname}/entities/*.js`] });
        return createConnection(connectionOptions);
    }
}
