import express from 'express';
import dotenv from 'dotenv';
import { createRouter } from './router/index';
import cors from 'cors';

function initServer() {
    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 3000;
    
    app.use(express.json());
    app.use(cors());

    const router = createRouter();
    app.use(router);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

initServer();