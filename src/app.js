import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

import eventRoutes from "./routes/book.route"
app.use("/api/events",eventRoutes)
// Routes (example)
app.get('/verify', (req, res) => {
  res.json({ message: 'API is running' });
});

export default app;
