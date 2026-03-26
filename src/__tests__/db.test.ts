/**
 * @jest-environment node
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Operations', () => {
  it('should be able to initialize the Prisma client', () => {
    expect(prisma).toBeDefined();
  });

  it('should have the expected models for CRM V2', () => {
    expect(prisma.lead).toBeDefined();
    expect(prisma.auditLog).toBeDefined();
    expect(prisma.tutorApplication).toBeDefined();
    expect(prisma.student).toBeDefined();
  });
});
