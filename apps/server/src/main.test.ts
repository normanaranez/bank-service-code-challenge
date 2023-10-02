import express from 'express';
import request from 'supertest';

const app = express();

describe('Banking API', () => {
  let server;
  let customerId: string | null = null;

  beforeAll(() => {
    server = app.listen(3000); // Use a different port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should create a new customer', async () => {
    const response = await request(server)
      .post('/customers')
      .send({ name: 'TestCustomer', initialDeposit: 100 });

    customerId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name', 'TestCustomer');
    expect(response.body).toHaveProperty('balance', 100);
    
  });

  it('should deposit money into a customer account', async () => {
    const response = await request(server)
      .post(`/customers/${customerId}/deposit`)
      .send({ amount: 50 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance', 150);
  });

  it('should withdraw money from a customer account', async () => {
    const response = await request(server)
      .post(`/customers/${customerId}/withdraw`)
      .send({ amount: 30 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance', 120);
  });

  it('should transfer money between customers', async () => {

    const recipient = await request(server)
      .post('/customers')
      .send({ name: 'Recipient', initialDeposit: 10 });

    const recipientId = recipient.body.id;

    const response = await request(server)
      .post(`/customers/${customerId}/transfer/${recipientId}`)
      .send({ amount: 50 });

    expect(response.status).toBe(200);
    expect(response.body.from).toHaveProperty('balance', 70);
    expect(response.body.to).toHaveProperty('balance', 60);
  });

  it('should get a customer balance', async () => {
    
    const response = await request(server).get(`/customers/${customerId}/balance`);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('balance', 70);

  });

  it('should get the total bank balance', async () => {
    const response = await request(server).get('/bank/total-balance');

    expect(response.status).toBe(200);
    // You may want to update this expectation based on your initial data
    expect(response.body).toHaveProperty('totalBalance', 130);
  });
});
