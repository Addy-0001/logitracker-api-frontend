import { rest } from 'msw';

export const handlers = [
    rest.get('/api/user/getUsers', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                users: [
                    { _id: '1', firstName: 'John', lastName: 'Doe', phone: '+9771234567890' },
                    { _id: '2', firstName: 'Jane', lastName: 'Smith', phone: '+9770987654321' },
                ],
            })
        );
    }),
    rest.post('/api/auth/admin-login', (req, res, ctx) => {
        const { email, password } = req.body;
        if (email === 'admin@example.com' && password === 'password123') {
            return res(
                ctx.status(200),
                ctx.json({
                    success: true,
                    token: 'mock-token',
                    user: { email, role: 'admin' },
                })
            );
        }
        return res(
            ctx.status(401),
            ctx.json({ success: false, message: 'Invalid credentials' })
        );
    }),
    rest.post('/api/job/createJob', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ _id: 'job123', driverInfo: { id: '1', name: 'John Doe', phone: '+9771234567890' } })
        );
    }),
    rest.get('/api/job', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    _id: 'job123',
                    pickupInfo: { name: 'Test Customer', email: 'test@example.com', latitude: 27.7172, longitude: 85.3240 },
                    dropoffInfo: { name: 'Test Customer', email: 'test@example.com', latitude: 27.7172, longitude: 85.3240 },
                    driverInfo: { id: '1', name: 'John Doe', phone: '+9771234567890' },
                    status: 'pending',
                    isUrgent: false,
                    createdAt: new Date().toISOString(),
                },
            ])
        );
    }),
];

export const mswServer = require('msw/node').setupServer(...handlers);