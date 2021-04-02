import 'reflect-metadata';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export class Database {
    private connection!: Connection;

    public async connect(): Promise<Connection> {
        const connectionOptions = await getConnectionOptions();
        Object.assign(connectionOptions, { entities: [`${__dirname}/entities/*.ts`, `${__dirname}/entities/*.js`] });
        try {
            this.connection = await createConnection(connectionOptions);
            return this.connection;
        } catch (e) {
            throw Error(e);
        }
    }

    public close(): Promise<void> {
        return this.connection.close();
    }
}
