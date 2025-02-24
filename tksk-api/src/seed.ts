import { PrismaClient } from '@prisma/client';
import { fakerJA as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 10; i++) {
    const userAccount = await prisma.userAccount.create({
      data: {
        firstName: faker.person.firstName(),
        firstNamePhonetic: faker.person.firstName(),
        lastName: faker.person.lastName(),
        lastNamePhonetic: faker.person.lastName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number(),
        registeredAt: faker.date.past(),
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        userAccountId: userAccount.id,
        amount: parseFloat(faker.finance.amount()),
        term: faker.date.future().toISOString(),
        dueDate: faker.date.future(),
      },
    });

    await prisma.invoicePayment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        paidAt: faker.date.recent(),
      },
    });

    await prisma.paymentReminderPhoneCall.create({
      data: {
        userAccountId: userAccount.id,
        summary: faker.lorem.sentence(),
        calledAt: faker.date.recent(),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
