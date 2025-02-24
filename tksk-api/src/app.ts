import cors from 'cors'; 
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());

app.get('/hello', (req: Request, res: Response) => {
  const d = {
    id: 1,
    message: 'hello! you!',
  }
  res.json(d);
});

app.get('/account', async (req: Request, res: Response) => {
  try {
    const userAccounts = await prisma.userAccount.findMany();
    res.json(userAccounts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/account/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userAccount = await prisma.userAccount.findUnique({
      where: { id: Number(id) },
      include: { Invoice: true },
    });
    if (userAccount) {
      res.json(userAccount);
    } else {
      res.status(404).json({ error: 'not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
