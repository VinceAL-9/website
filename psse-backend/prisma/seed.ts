import { PrismaClient, Role, Category } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

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
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@psse.org' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@psse.org',
      password: hashedPassword,
      role: Role.ADMIN,
      studentId: 'ADMIN-001',
    },
  });
  console.log(`   Created admin user: ${adminUser.email}`);

  // ===========================================
  // Seed Officers (23 positions as per SRS FR4.1)
  // ===========================================
  console.log('👥 Seeding officers...');
  const officers = [
    // Executive Board (5 positions)
    { name: 'Juan Dela Cruz', position: 'President', category: 'Executive Board', photoUrl: '/images/officers/president.jpg', academicYear: '2024-2025', order: 1 },
    { name: 'Maria Santos', position: 'VP External', category: 'Executive Board', photoUrl: '/images/officers/vp-external.jpg', academicYear: '2024-2025', order: 2 },
    { name: 'Pedro Reyes', position: 'VP Internal', category: 'Executive Board', photoUrl: '/images/officers/vp-internal.jpg', academicYear: '2024-2025', order: 3 },
    { name: 'Ana Garcia', position: 'VP Media', category: 'Executive Board', photoUrl: '/images/officers/vp-media.jpg', academicYear: '2024-2025', order: 4 },
    { name: 'Jose Rizal', position: 'VP Tech', category: 'Executive Board', photoUrl: '/images/officers/vp-tech.jpg', academicYear: '2024-2025', order: 5 },

    // Administrative & Finance (8 positions)
    { name: 'Carmen Luna', position: 'Secretary', category: 'Administrative & Finance', photoUrl: '/images/officers/secretary.jpg', academicYear: '2024-2025', order: 6 },
    { name: 'Miguel Torres', position: 'Asst. Secretary', category: 'Administrative & Finance', photoUrl: '/images/officers/asst-secretary.jpg', academicYear: '2024-2025', order: 7 },
    { name: 'Rosa Flores', position: 'Auditor', category: 'Administrative & Finance', photoUrl: '/images/officers/auditor.jpg', academicYear: '2024-2025', order: 8 },
    { name: 'Carlos Mendoza', position: 'Asst. Auditor', category: 'Administrative & Finance', photoUrl: '/images/officers/asst-auditor.jpg', academicYear: '2024-2025', order: 9 },
    { name: 'Isabella Cruz', position: 'Business Manager', category: 'Administrative & Finance', photoUrl: '/images/officers/business-manager.jpg', academicYear: '2024-2025', order: 10 },
    { name: 'Fernando Aquino', position: 'Asst. Business Manager', category: 'Administrative & Finance', photoUrl: '/images/officers/asst-business-manager.jpg', academicYear: '2024-2025', order: 11 },
    { name: 'Lucia Bautista', position: 'General Treasurer', category: 'Administrative & Finance', photoUrl: '/images/officers/general-treasurer.jpg', academicYear: '2024-2025', order: 12 },
    { name: 'Antonio Ramos', position: 'PIO', category: 'Administrative & Finance', photoUrl: '/images/officers/pio.jpg', academicYear: '2024-2025', order: 13 },

    // Representatives (4 positions)
    { name: 'Patricia Villanueva', position: '1st Year Representative', category: 'Representatives', photoUrl: '/images/officers/1st-year-rep.jpg', academicYear: '2024-2025', order: 14 },
    { name: 'Roberto Fernandez', position: '2nd Year Representative', category: 'Representatives', photoUrl: '/images/officers/2nd-year-rep.jpg', academicYear: '2024-2025', order: 15 },
    { name: 'Elena Gonzales', position: '3rd Year Representative', category: 'Representatives', photoUrl: '/images/officers/3rd-year-rep.jpg', academicYear: '2024-2025', order: 16 },
    { name: 'Marco Dela Rosa', position: '4th Year Representative', category: 'Representatives', photoUrl: '/images/officers/4th-year-rep.jpg', academicYear: '2024-2025', order: 17 },

    // Year Level Treasurers (4 positions)
    { name: 'Sofia Castillo', position: '1st Year Treasurer', category: 'Year Level Treasurers', photoUrl: '/images/officers/1st-year-treasurer.jpg', academicYear: '2024-2025', order: 18 },
    { name: 'Daniel Aguilar', position: '2nd Year Treasurer', category: 'Year Level Treasurers', photoUrl: '/images/officers/2nd-year-treasurer.jpg', academicYear: '2024-2025', order: 19 },
    { name: 'Andrea Lim', position: '3rd Year Treasurer', category: 'Year Level Treasurers', photoUrl: '/images/officers/3rd-year-treasurer.jpg', academicYear: '2024-2025', order: 20 },
    { name: 'Gabriel Santos', position: '4th Year Treasurer', category: 'Year Level Treasurers', photoUrl: '/images/officers/4th-year-treasurer.jpg', academicYear: '2024-2025', order: 21 },

    // Ambassadors (2 positions)
    { name: 'Victoria Tan', position: 'Ambassador', category: 'Ambassadors', photoUrl: '/images/officers/ambassador.jpg', academicYear: '2024-2025', order: 22 },
    { name: 'Rafael Morales', position: 'Ambassadress', category: 'Ambassadors', photoUrl: '/images/officers/ambassadress.jpg', academicYear: '2024-2025', order: 23 },
  ];

  for (const officer of officers) {
    const created = await prisma.officer.create({
      data: officer,
    });
    console.log(`   Created officer: ${created.name} - ${created.position}`);
  }

  // ===========================================
  // Seed Events (mix of past and upcoming events)
  // ===========================================
  console.log('📅 Seeding events...');
  const events = [
    // Upcoming Events
    {
      title: 'PSSE General Assembly 2025',
      description:
        'Join us for our annual General Assembly where we discuss the plans and activities for the upcoming academic year. All members are encouraged to attend!',
      date: new Date('2025-01-15T14:00:00Z'),
      imageUrl: '/images/latest-events/growcon-ph-2025.jpg',
      location: 'College of Engineering Auditorium',
      isUpcoming: true,
    },
    {
      title: 'Tech Talk: Introduction to Software Architecture',
      description:
        'A seminar covering modern software architecture patterns, featuring industry professionals sharing their insights and experiences.',
      date: new Date('2025-02-20T10:00:00Z'),
      imageUrl: '/images/latest-events/merch-designing.jpg',
      location: 'Room 301, Engineering Building',
      isUpcoming: true,
    },
    // Past Events
    {
      title: 'iThink Hackathon 2024',
      description:
        'A 24-hour coding competition where students built innovative software solutions. Teams competed for prizes and recognition.',
      date: new Date('2024-11-15T08:00:00Z'),
      imageUrl: '/images/latest-events/ithink-hackathon.jpg',
      location: 'CPU Computer Laboratory',
      isUpcoming: false,
    },
    {
      title: 'GrowCon PH 2024',
      description:
        'National software engineering conference featuring industry leaders and innovative tech solutions. Students networked with professionals.',
      date: new Date('2024-10-20T09:00:00Z'),
      imageUrl: '/images/latest-events/growcon-ph-2025.jpg',
      location: 'SMX Convention Center',
      isUpcoming: false,
    },
    {
      title: 'PSSE Merchandise Design Workshop',
      description:
        'Creative workshop where members designed official PSSE merchandise. Winning designs were produced for the organization.',
      date: new Date('2024-09-10T13:00:00Z'),
      imageUrl: '/images/latest-events/merch-designing.jpg',
      location: 'Engineering Building Room 205',
      isUpcoming: false,
    },
    {
      title: 'Software Engineering Summit',
      description:
        'Annual summit bringing together students, faculty, and industry professionals to discuss the future of software engineering.',
      date: new Date('2024-08-25T15:00:00Z'),
      imageUrl: '/images/latest-events/ithink-hackathon.jpg',
      location: 'CPU Auditorium',
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
  // Seed Products (5 sample products)
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
      name: 'PSSE Premium Lanyard - Gold Edition',
      description:
        'Limited edition gold-accented lanyard with the PSSE emblem. A collector\'s item for true PSSE enthusiasts!',
      price: 200.0,
      stock: 25,
      category: Category.LANYARD,
      imageUrl: '/images/merch/lanyard-gold.jpg',
      isFeatured: true,
    },
    {
      name: 'PSSE T-Shirt - Black Edition',
      description:
        'Premium cotton t-shirt in black with the PSSE emblem. Available in various sizes (S, M, L, XL).',
      price: 450.0,
      stock: 30,
      category: Category.TSHIRT,
      imageUrl: '/images/merch/tshirt-black.jpg',
      isFeatured: true,
    },
    {
      name: 'PSSE T-Shirt - White Edition',
      description:
        'Premium cotton t-shirt in white with the PSSE emblem. Available in various sizes (S, M, L, XL).',
      price: 450.0,
      stock: 25,
      category: Category.TSHIRT,
      imageUrl: '/images/merch/tshirt-white.jpg',
      isFeatured: false,
    },
    {
      name: 'PSSE Sticker Pack',
      description:
        'A set of 5 high-quality vinyl stickers featuring various PSSE designs. Waterproof and durable!',
      price: 75.0,
      stock: 100,
      category: Category.STICKER,
      imageUrl: '/images/merch/sticker-pack.jpg',
      isFeatured: false,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`   Created product: ${created.name}`);
  }

  console.log('');
  console.log('✅ Database seed completed successfully!');
  console.log('');
  console.log('📊 Seed Summary:');
  console.log('   - 1 Admin User (admin@psse.org / admin123)');
  console.log('   - 23 Officers (Executive Board, Committee Heads, Committee Members)');
  console.log('   - 3 Events');
  console.log('   - 5 Products (2 Lanyards, 2 T-Shirts, 1 Sticker Pack)');
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
