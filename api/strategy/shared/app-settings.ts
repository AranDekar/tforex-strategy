process.env.NODE_ENV = process.env.NODE_ENV || 'development';

export class Config {
    public static settings: AppSettings;

    public static setup(): AppSettings {
        if (Config.settings) {
            return Config.settings;
        }

        console.log(`app running in ${process.env.NODE_ENV} mode`);

        if (process.env.NODE_ENV === 'development') {
            this.settings = {
                gateway_base_path: 'http://localhost:10020',
                strategy_base_path: 'http://localhost:10020',
                instrument_base_path: 'http://localhost:1040',
                // mongo_db_connection_string: `mongodb://tforex-user:tforex-password@cluster0-shard-00-00-tyqk3.mongodb.net:27017,` +
                // `cluster0-shard-00-01-tyqk3.mongodb.net:27017,cluster0-shard-00-02-tyqk3.mongodb.net:27017/tforex?` +
                // `ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
                mongo_db_connection_string: process.env.MONGO || `mongodb://mongo/tforex`,
                api_key: '1234',
                kafka_conn_string: 'localhost:2181/',
                candle_history_client_id: 'candle-history',
            };
        }
        return this.settings;
    }
    constructor() {
        Config.setup();
    }
}
Config.setup();

interface AppSettings {
    gateway_base_path: string;
    strategy_base_path: string;
    instrument_base_path: string;
    mongo_db_connection_string: string;
    api_key: string;
    kafka_conn_string: string;
    candle_history_client_id: string;
}
