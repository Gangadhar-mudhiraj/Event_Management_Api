import { Pool } from "pg";
import { configDotenv } from "dotenv";
configDotenv('.env')

const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT
})

console.log(process.env.DB_USER,
    process.env.DB_HOST,);


const createTables=async ()=>{
    try {
        await pool.query(
        `
        CREATE TABLE IF NOT EXISTS events(
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        dateTime TIMESTAMP NOT NULL   
        )
        `
    )

    await pool.query(
        `
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE
        )
        `
    )

    await pool.query(
        `
        CREATE TABLE IF NOT EXISTS registrations(
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE
        )
        `
    )

    console.log("all tables created");
    
    } catch (error) {
        console.error("Error creating tables");        
    }
}


export  {pool,createTables};