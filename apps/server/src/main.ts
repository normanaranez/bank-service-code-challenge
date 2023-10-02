import cors from 'cors';
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();


app.use(express.json());

app.use(cors({
  origin: '*',
  credentials: true
}));


interface Customer {
  id: string;
  name: string;
  balance: number;
}

const customers: Customer[] = [];

// Create a new customer
app.post('/customers', (req: Request, res: Response) => {

  const { name, initialDeposit } = req.body;

  console.log(req.body);

  if (!name || initialDeposit === undefined || initialDeposit <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const customer: Customer = { id: uuidv4(), name, balance: initialDeposit };

  customers.push(customer);

  res.status(201).json(customer);

});

// Deposit money into a customer's account
app.post('/customers/:id/deposit', (req: Request, res: Response) => {

  const customerId = req.params.id;
  
  const amount = req.body.amount;
  
  if (!customerId || amount === undefined || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  customer.balance += amount;
  res.json(customer);
});

// Withdraw money from a customer's account
app.post('/customers/:id/withdraw', (req: Request, res: Response) => {
  const customerId = req.params.id;
  const amount = req.body.amount;
  if (!customerId || amount === undefined || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  if (customer.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  customer.balance -= amount;
  res.json(customer);
});

// Transfer money from one customer to another
app.post('/customers/:from/transfer/:to', (req: Request, res: Response) => {
  
  console.log('transfer', req.params, req.body);

  const fromCustomer = customers.find((c) => c.id === req.params.from);
  const toCustomer = customers.find((c) => c.id === req.params.to);

  console.log('fromCustomer', fromCustomer);
  console.log('toCustomer', toCustomer);
  
  const amount = req.body.amount;
  
  if (!fromCustomer || !toCustomer || amount === undefined || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  if (fromCustomer.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  fromCustomer.balance -= amount;
  toCustomer.balance += amount;

  console.log('fromCustomer', fromCustomer);
  console.log('toCustomer', toCustomer);

  res.json({ from: fromCustomer, to: toCustomer });
});

// Check a customer's balance
app.get('/customers/:id/balance', (req: Request, res: Response) => {

  const customer = customers.find((c) => c.id === req.params.id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json({ balance: customer.balance });
});

// Get the total balance of the bank
app.get('/bank/total-balance', (req: Request, res: Response) => {
  const totalBalance = customers.reduce((total, customer) => total + customer.balance, 0);
  res.json({ totalBalance });
});

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
