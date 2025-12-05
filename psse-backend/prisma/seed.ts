import { PrismaClient, Role, Category, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Initialize Prisma with pg adapter for Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // ===========================================
  // Seed Admin User
  // ===========================================
  console.log('👤 Seeding admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@psse.org' },
    update: {},
    create: {
      email: 'admin@psse.org',
      password: 'password123', // TODO: Replace with hashed password when auth is implemented
      role: Role.ADMIN,
      studentId: 'ADMIN-001',
    },
  });
  console.log(`   Created admin user: ${adminUser.email}`);

  // ===========================================
  // Seed Officers
  // ===========================================
  console.log('👥 Seeding officers...');
  const officers = [
    {
      name: 'Juan Dela Cruz',
      position: 'President',
      category: 'Executive Board',
      photoUrl: '/images/officers/president.jpg',
      academicYear: '2024-2025',
      order: 1,
    },
    {
      name: 'Maria Santos',
      position: 'VP Internal',
      category: 'Executive Board',
      photoUrl: '/images/officers/vp-internal.jpg',
      academicYear: '2024-2025',
      order: 2,
    },
    {
      name: 'Pedro Reyes',
      position: 'VP External',
      category: 'Executive Board',
      photoUrl: '/images/officers/vp-external.jpg',
      academicYear: '2024-2025',
      order: 3,
    },
  ];

  for (const officer of officers) {
    const created = await prisma.officer.create({
      data: officer,
    });
    console.log(`   Created officer: ${created.name} - ${created.position}`);
  }

  // ===========================================
  // Seed Events
  // ===========================================
  console.log('📅 Seeding events...');
  const events = [
    {
      title: 'PSSE General Assembly 2025',
      description:
        'Join us for our annual General Assembly where we discuss the plans and activities for the upcoming academic year. All members are encouraged to attend!',
      date: new Date('2025-01-15T14:00:00Z'),
      imageUrl: '/images/events/general-assembly.jpg',
      location: 'College of Engineering Auditorium',
      isUpcoming: true,
    },
    {
      title: 'Tech Talk: Introduction to Power Systems',
      description:
        'A seminar covering the fundamentals of power systems engineering, featuring industry professionals sharing their insights and experiences.',
      date: new Date('2024-11-20T10:00:00Z'),
      imageUrl: '/images/events/tech-talk.jpg',
      location: 'Room 301, EE Building',
      isUpcoming: false,
    },
  ];

  for (const event of events) {
    const created = await prisma.event.create({
      data: event,
    });
    console.log(`   Created event: ${created.title}`);
  }

  // ===========================================
  // Seed Products
  // ===========================================
  console.log('🛍️ Seeding products...');
  const products = [
    {
      name: 'PSSE Official Lanyard',
      description:
        'High-quality lanyard featuring the PSSE logo. Perfect for holding your ID and showing your PSSE pride!',
      price: 150.0,
      stock: 50,
      category: Category.LANYARD,
      imageUrl: '/images/merch/lanyard.jpg',
      isFeatured: true,
    },
    {
      name: 'PSSE T-Shirt - Black Edition',
      description:
        'Premium cotton t-shirt in black with the PSSE emblem. Available in various sizes.',
      price: 450.0,
      stock: 30,
      category: Category.TSHIRT,
      imageUrl: '/images/merch/tshirt-black.jpg',
      isFeatured: true,
    },
    {
      name: 'PSSE T-Shirt - White Edition',
      description:
        'Premium cotton t-shirt in white with the PSSE emblem. Available in various sizes.',
      price: 450.0,
      stock: 25,
      category: Category.TSHIRT,
      imageUrl: '/images/merch/tshirt-white.jpg',
      isFeatured: false,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`   Created product: ${created.name}`);
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
