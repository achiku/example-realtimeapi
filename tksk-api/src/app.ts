import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify();
const prisma = new PrismaClient();
const PORT = 3001;

fastify.register(cors);

fastify.get('/token', async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('token request');
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "shimmer",
        instructions: "あなたは日本語で会話する、督促を担当するアシスタント太郎という名前です。敬語は使わずにフレンドリーに話してください。まず最初に相手が話す前に自己紹介をしてください。会話相手の名前はチクアキラと言います。彼は12月30日までに4万円を支払うと約束しましたが返済が確認出来ていません。可能な限り遅延している理由を把握したうえで、必ず次の支払約束を取り付けてください。",
      }),
    });
    const response = await r.json();
    console.log(response);
    reply.send(response);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.get('/account', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userAccounts = await prisma.userAccount.findMany();
    reply.send(userAccounts);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.get('/account/:id', async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  try {
    const userAccount = await prisma.userAccount.findUnique({
      where: { id: Number(id) },
      include: { Invoice: true },
    });
    if (userAccount) {
      reply.send(userAccount);
    } else {
      reply.status(404).send({ error: 'not found' });
    }
  } catch (error) {
    console.log(error);
    reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.listen({ port: PORT }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on ${address}`);
});
