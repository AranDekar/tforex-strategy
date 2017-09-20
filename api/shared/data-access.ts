import { Mongoose } from "mongoose";

import * as api from '../../api';

export class DataAccess {
    public static mongooseInstance: Mongoose;

    public static connect(): Mongoose {
        if (DataAccess.mongooseInstance) {
            return DataAccess.mongooseInstance;
        }

        // mongoose
        this.mongooseInstance = new Mongoose();
        (<any>this.mongooseInstance).Promise = global.Promise;
        this.mongooseInstance.connection.once("open", () => {
            console.log("Conected to mongodb.");
        });
        console.log(`trying to connect to ${api.Config.settings.mongo_db_connection_string}`);

        this.mongooseInstance.connect(api.Config.settings.mongo_db_connection_string, {
            useMongoClient: true,
            /* other options */
        });
        return this.mongooseInstance;
    }

    constructor() {
        DataAccess.connect();
    }
}

DataAccess.connect();
