const { PrismaClient: PostgresClient } = require('../../prisma/generated/postgres');
const { PrismaClient: MariaClient } = require('../../prisma/src/generated/prisma');
const { PrismaClient: MariaBillClient } = require('../../prisma/generated/mariadb');

const postgres = new PostgresClient();
const mariadb = new MariaClient();
const mariadbBill = new MariaBillClient();

module.exports = {
  postgres,
  mariadb,
  mariadbBill
};