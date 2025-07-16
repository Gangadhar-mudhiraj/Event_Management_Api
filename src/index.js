import { configDotenv } from "dotenv";
configDotenv('.env')

import {pool,createTables} from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 8080;

// Connect DB and start server
pool.connect()
    .then(() => {
      app.listen(PORT, async() => {
        console.log(`Server running on http://localhost:${PORT}`);
        await createTables()

      });
    })
    .catch(err=>{
      console.error("Db connection failure",err);
    })
