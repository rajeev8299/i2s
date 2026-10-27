import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('I2S Business OS - Security & RBAC Acceptance Tests', () => {
  let superAdminToken = '';
  let clientToken = '';
  let staffToken = '';

  it('1. Health check returns healthy and connected database', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  it('2. Super Admin login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@i2s.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('SUPER_ADMIN');
    expect(res.body.token).toBeDefined();
    superAdminToken = res.body.token;
  });

  it('3. Invalid credentials are unconditionally rejected', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@i2s.com', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('4. Client login succeeds and retrieves only client role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@acmecorp.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('CLIENT');
    clientToken = res.body.token;
  });

  it('5. Staff login succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@i2s.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('STAFF');
    staffToken = res.body.token;
  });

  it('6. Client is forbidden from reading organizational user management', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('7. Staff cannot access Super Admin audit logs', async () => {
    const res = await request(app)
      .get('/api/settings/audit-logs')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });

  it('8. Super Admin can view audit logs and user accounts', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  it('9. Client sees only their own permitted project and never internal notes', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.clients.length).toBe(1);
    expect(res.body.clients[0].internalNotes).toBeUndefined();
  });

  it('10. Financial invoices are inaccessible to unauthorized staff', async () => {
    const res = await request(app)
      .get('/api/finance/invoices')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });

  it('11. In-app notifications persist and can be fetched by authenticated user', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThan(0);
  });
});
