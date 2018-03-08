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
                strategies_base_path: 'http://localhost:10030/strategies',
                instruments_base_path: 'http://127.0.0.1:10040/instruments',
                mongo_db_connection_string: process.env.MONGO || `mongodb://mongodb/tss`,
                api_key: '1234',
                kafka_conn_string: process.env.KAFKA || 'kafka:9092',
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
    strategies_base_path: string;
    instruments_base_path: string;
    mongo_db_connection_string: string;
    api_key: string;
    kafka_conn_string: string;
    candle_history_client_id: string;
}
