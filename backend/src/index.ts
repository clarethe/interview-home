import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import cors from 'cors' 
const prisma = new PrismaClient()
const app = express()
app.use(express.json())
app.use(cors())

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/', async (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' })
})

app.post('/leads', async (req: Request, res: Response) => {
  //get name and email from the request body
  const { name, email } = req.body
  const lead = await prisma.lead.create({
    data: {
      firstName: String(name),
      email: String(email),
    },
  })
  res.json(lead)
})

app.get('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const lead = await prisma.lead.findUnique({
    where: {
      id: Number(id),
    },
  })
  res.json(lead)
})

app.get('/leads', async (req: Request, res: Response) => {
  const leads = await prisma.lead.findMany()
  res.json(leads)
})

app.patch('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { message } = req.body
  const lead = await prisma.lead.update({
    where: {
      id: Number(id),
    },
    data: {
      message: String(message),
    },
  })
  res.json(lead)
})

app.delete('/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  
  await prisma.lead.delete({
    where: {
      id: Number(id),
    },
  })
  res.json()
})

app.delete('/leads', async (req: Request, res: Response) => {
  const ids = req.query.ids as string[];  

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
  console.log('Express server is running on port 4000')
})
