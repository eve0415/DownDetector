const production = {
    type: 'postgres',
    host: process.env.DATABASE_SERVICE_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
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
