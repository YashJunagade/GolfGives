import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import scoreRoutes from './routes/score.routes.js';
import charityRoutes from './routes/charity.routes.js';
import drawRoutes from './routes/draw.routes.js';
import winnerRoutes from './routes/winner.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import adminRoutes from './routes/admin.routes.js';
import profileRoutes from './routes/profile.routes.js';
import donationRoutes from './routes/donation.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Raw body needed for Stripe webhooks — must be before express.json()
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',         authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/scores',       scoreRoutes);
app.use('/api/charities',    charityRoutes);
app.use('/api/draws',        drawRoutes);
app.use('/api/winners',      winnerRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/profile',     profileRoutes);
app.use('/api/donation',    donationRoutes);

app.use(errorHandler);

export default app;
