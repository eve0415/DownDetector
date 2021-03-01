const production = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    migrationsRun: true,
    synchronize: true,
};

const development = {
    type: 'better-sqlite3',
    database: './database.sqlite',
    migrationsRun: true,
    synchronize: true,
};

export default process.env.NODE_ENV ? development : production;
