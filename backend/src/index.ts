import { PrismaClient } from '@prisma/client';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import Papa from 'papaparse';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

type LeadType = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string; // Added to support gender field
};

// Middleware for CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/', async (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

app.post('/leads', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const lead = await prisma.lead.create({
    data: {
      firstName: String(name),
      email: String(email),
    },
  });
  
  res.json(lead);
});

app.post('/leads/:id/guess-gender', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const lead = await prisma.lead.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  try {
    const response = await axios.get(`https://api.genderize.io?name=${name}`);
    const gender = response.data.gender;

    const updatedLead = await prisma.lead.update({
      where: {
        id: Number(id),
      },
      data: {
        gender: gender,
      },
    });

    res.json(updatedLead);
  } catch (error) {
    console.error('Error guessing gender:', error);
    res.status(500).json({ message: 'Error guessing gender' });
  }
});

app.post('/leads/insert-from-csv', async (req: Request, res: Response) => {
  const { csvData } = req.body;

  if (!csvData) {
    return res.status(400).json({ message: 'CSV data is required' });
  }

  Papa.parse(csvData, {
    header: true,
    complete: async (results) => {
      const validLeads = results.data.filter((lead: any) => { // Use `any` to bypass type issue temporarily
        return lead.firstName && lead.lastName && lead.email;
      });

      try {
        const createdLeads = await prisma.lead.createMany({
          data: validLeads.map((lead: any) => ({
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
          })),
        });

        res.json({
          successCount: createdLeads.count,
          errorCount: results.data.length - validLeads.length,
          errors: results.errors.map((error) => ({
            row: error.row,
            message: error.message,
          })),
        });
      } catch (error) {
        console.error('Error inserting leads:', error);
        res.status(500).json({ message: 'Error inserting leads' });
      }
    },
  });
});

app.get('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const lead = await prisma.lead.findUnique({
    where: {
      id: Number(id),
    },
  });
  res.json(lead);
});

app.get('/leads', async (req: Request, res: Response) => {
  const leads = await prisma.lead.findMany();
  res.json(leads);
});

app.patch('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const lead = await prisma.lead.update({
    where: {
      id: Number(id),
    },
    data: {
      message: String(message),
    },
  });

  res.json(lead);
});

app.delete('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.lead.delete({
    where: {
      id: Number(id),
    },
  });

  res.json({ message: 'Lead deleted successfully' });
});

app.delete('/leads', async (req: Request, res: Response) => {
  const ids = req.query.ids as string[];

  if (!ids) {
    return res.status(400).json({ message: 'IDs are required' });
  }

  const idsArray = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

  try {
    await Promise.all(idsArray.map(async (id: number) => {
      await prisma.lead.delete({
        where: {
          id: id,
        },
      });
    }));

    res.json({ message: 'Leads deleted successfully' });
  } catch (error) {
    console.error('Error deleting leads:', error);
    res.status(500).json({ message: 'Error deleting leads' });
  }
});

app.listen(4000, () => {
  console.log('Express server is running on port 4000');
});
