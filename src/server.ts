import 'reflect-metadata';
import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cron from 'node-cron';

import { routes } from './routes';
import { AppDataSource } from '@/data-source';
import { DefaultError } from '@errors/defaultError';
import AppError from './errors/AppError';
import './apis/hubsoft';
import ContractSignatureChecker from '@services/crons/ContractSignatureChecker';
import { updateTokens } from '@services/crons/updateTokens';

const fastify = Fastify({
  logger: true,
});

fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'));

fastify.register(cors, {
  origin: process.env.ALLOW_API_ORIGIN || '*',
  allowedHeaders: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Amz-User-Agent',
    'X-Amzn-Trace-Id',
    'accept-version',
    'time-zone',
  ],
});

fastify.setErrorHandler((error, _, response) => {
  if (error instanceof DefaultError || error instanceof AppError) {
    response.code(error?.statusCode);

    return {
      success: false,
      message: error.message,
    };
  }

  console.log(error);

  return response.status(500).send({
    status: 'error',
    error: 'Internal server error.',
  });
});

if (!AppDataSource.isInitialized) {
  AppDataSource.initialize();
}

cron.schedule('*/5 * * * *', () => {
  new ContractSignatureChecker().execute();
  updateTokens();
});

fastify.register(routes);

fastify.listen(
  { port: Number(process.env.PORT) || 9999, host: '0.0.0.0' },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  },
);
