const { PrismaClient: PostgresClient } = require('../../prisma/generated/postgres');
const { PrismaClient: MariaClient } = require('../../prisma/src/generated/prisma');

const postgres = new PostgresClient();
const mariadb = new MariaClient();

module.exports = {
  postgres,
  mariadb
};