import { PrismaClient, Role, Category, OfficerCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Initialize Prisma with pg adapter for Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
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
    update: { 
      password: hashedPassword,
      isVerified: true,
    },
    create: {
      email: 'admin@psse.org',
      password: hashedPassword,
      name: 'PSSE Admin',
      role: Role.ADMIN,
      studentId: 'ADMIN-001',
      isVerified: true,
    },
  });
  console.log(`   Created admin user: ${adminUser.email}`);

  // ===========================================
  // Seed Officers (23 positions as per SRS FR4.1)
  // ===========================================
  console.log('👥 Seeding officers...');
  const officers = [
    // Executive Board (5 positions)
    { name: 'Juan Dela Cruz', position: 'President', category: OfficerCategory.EXEC, photoUrl: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=President', academicYear: '2024-2025', order: 1 },
    { name: 'Maria Santos', position: 'VP External', category: OfficerCategory.EXEC, photoUrl: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=VP+External', academicYear: '2024-2025', order: 2 },
    { name: 'Pedro Reyes', position: 'VP Internal', category: OfficerCategory.EXEC, photoUrl: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=VP+Internal', academicYear: '2024-2025', order: 3 },
    { name: 'Ana Garcia', position: 'VP Media', category: OfficerCategory.EXEC, photoUrl: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=VP+Media', academicYear: '2024-2025', order: 4 },
    { name: 'Jose Rizal', position: 'VP Tech', category: OfficerCategory.EXEC, photoUrl: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=VP+Tech', academicYear: '2024-2025', order: 5 },

    // Administrative & Finance (8 positions)
    { name: 'Carmen Luna', position: 'Secretary', category: OfficerCategory.ADMIN, photoUrl: 'https://via.placeholder.com/300x300/2563EB/FFFFFF?text=Secretary', academicYear: '2024-2025', order: 6 },
    { name: 'Miguel Torres', position: 'Asst. Secretary', category: OfficerCategory.ADMIN, photoUrl: 'https://via.placeholder.com/300x300/2563EB/FFFFFF?text=Asst+Secretary', academicYear: '2024-2025', order: 7 },
    { name: 'Rosa Flores', position: 'Auditor', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=Auditor', academicYear: '2024-2025', order: 8 },
    { name: 'Carlos Mendoza', position: 'Asst. Auditor', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=Asst+Auditor', academicYear: '2024-2025', order: 9 },
    { name: 'Isabella Cruz', position: 'Business Manager', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=Business+Manager', academicYear: '2024-2025', order: 10 },
    { name: 'Fernando Aquino', position: 'Asst. Business Manager', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=Asst+BM', academicYear: '2024-2025', order: 11 },
    { name: 'Lucia Bautista', position: 'General Treasurer', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=General+Treasurer', academicYear: '2024-2025', order: 12 },
    { name: 'Antonio Ramos', position: 'PIO', category: OfficerCategory.ADMIN, photoUrl: 'https://via.placeholder.com/300x300/2563EB/FFFFFF?text=PIO', academicYear: '2024-2025', order: 13 },

    // Representatives (4 positions)
    { name: 'Patricia Villanueva', position: '1st Year Representative', category: OfficerCategory.REP, photoUrl: 'https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=1st+Year+Rep', academicYear: '2024-2025', order: 14 },
    { name: 'Roberto Fernandez', position: '2nd Year Representative', category: OfficerCategory.REP, photoUrl: 'https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=2nd+Year+Rep', academicYear: '2024-2025', order: 15 },
    { name: 'Elena Gonzales', position: '3rd Year Representative', category: OfficerCategory.REP, photoUrl: 'https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=3rd+Year+Rep', academicYear: '2024-2025', order: 16 },
    { name: 'Marco Dela Rosa', position: '4th Year Representative', category: OfficerCategory.REP, photoUrl: 'https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=4th+Year+Rep', academicYear: '2024-2025', order: 17 },

    // Year Level Treasurers (4 positions)
    { name: 'Sofia Castillo', position: '1st Year Treasurer', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=1st+Year+Treasurer', academicYear: '2024-2025', order: 18 },
    { name: 'Daniel Aguilar', position: '2nd Year Treasurer', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=2nd+Year+Treasurer', academicYear: '2024-2025', order: 19 },
    { name: 'Andrea Lim', position: '3rd Year Treasurer', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=3rd+Year+Treasurer', academicYear: '2024-2025', order: 20 },
    { name: 'Gabriel Santos', position: '4th Year Treasurer', category: OfficerCategory.FINANCE, photoUrl: 'https://via.placeholder.com/300x300/059669/FFFFFF?text=4th+Year+Treasurer', academicYear: '2024-2025', order: 21 },

    // Ambassadors (2 positions)
    { name: 'Victoria Tan', position: 'Ambassador', category: OfficerCategory.AMBASSADOR, photoUrl: 'https://via.placeholder.com/300x300/DC2626/FFFFFF?text=Ambassador', academicYear: '2024-2025', order: 22 },
    { name: 'Rafael Morales', position: 'Ambassadress', category: OfficerCategory.AMBASSADOR, photoUrl: 'https://via.placeholder.com/300x300/DC2626/FFFFFF?text=Ambassadress', academicYear: '2024-2025', order: 23 },
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
      imageUrl: 'https://via.placeholder.com/800x600/1E3A8A/FFFFFF?text=PSSE+General+Assembly+2025',
      location: 'College of Engineering Auditorium',
      isUpcoming: true,
    },
    {
      title: 'Tech Talk: Introduction to Software Architecture',
      description:
        'A seminar covering modern software architecture patterns, featuring industry professionals sharing their insights and experiences.',
      date: new Date('2025-02-20T10:00:00Z'),
      imageUrl: 'https://via.placeholder.com/800x600/2563EB/FFFFFF?text=Tech+Talk+2025',
      location: 'Room 301, Engineering Building',
      isUpcoming: true,
    },
    // Past Events
    {
      title: 'iThink Hackathon 2024',
      description:
        'A 24-hour coding competition where students built innovative software solutions. Teams competed for prizes and recognition.',
      date: new Date('2024-11-15T08:00:00Z'),
      imageUrl: 'https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=iThink+Hackathon+2024',
      location: 'CPU Computer Laboratory',
      isUpcoming: false,
    },
    {
      title: 'GrowCon PH 2024',
      description:
        'National software engineering conference featuring industry leaders and innovative tech solutions. Students networked with professionals.',
      date: new Date('2024-10-20T09:00:00Z'),
      imageUrl: 'https://via.placeholder.com/800x600/059669/FFFFFF?text=GrowCon+PH+2024',
      location: 'SMX Convention Center',
      isUpcoming: false,
    },
    {
      title: 'PSSE Merchandise Design Workshop',
      description:
        'Creative workshop where members designed official PSSE merchandise. Winning designs were produced for the organization.',
      date: new Date('2024-09-10T13:00:00Z'),
      imageUrl: 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Merch+Design+Workshop',
      location: 'Engineering Building Room 205',
      isUpcoming: false,
    },
    {
      title: 'Software Engineering Summit',
      description:
        'Annual summit bringing together students, faculty, and industry professionals to discuss the future of software engineering.',
      date: new Date('2024-08-25T15:00:00Z'),
      imageUrl: 'https://via.placeholder.com/800x600/EA580C/FFFFFF?text=Software+Engineering+Summit',
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
      imageUrl: 'https://via.placeholder.com/400x400/1E3A8A/FFFFFF?text=PSSE+Lanyard',
      isFeatured: true,
    },
    {
      name: 'PSSE Premium Lanyard - Gold Edition',
      description:
        'Limited edition gold-accented lanyard with the PSSE emblem. A collector\'s item for true PSSE enthusiasts!',
      price: 200.0,
      stock: 25,
      category: Category.LANYARD,
      imageUrl: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=Gold+Lanyard',
      isFeatured: true,
    },
    {
      name: 'PSSE T-Shirt - Black Edition',
      description:
        'Premium cotton t-shirt in black with the PSSE emblem. Available in various sizes (S, M, L, XL).',
      price: 450.0,
      stock: 30,
      category: Category.TSHIRT,
      imageUrl: 'https://via.placeholder.com/400x400/1F2937/FFFFFF?text=Black+T-Shirt',
      isFeatured: true,
    },
    {
      name: 'PSSE T-Shirt - White Edition',
      description:
        'Premium cotton t-shirt in white with the PSSE emblem. Available in various sizes (S, M, L, XL).',
      price: 450.0,
      stock: 25,
      category: Category.TSHIRT,
      imageUrl: 'https://via.placeholder.com/400x400/F3F4F6/1F2937?text=White+T-Shirt',
      isFeatured: false,
    },
    {
      name: 'PSSE Sticker Pack',
      description:
        'A set of 5 high-quality vinyl stickers featuring various PSSE designs. Waterproof and durable!',
      price: 75.0,
      stock: 100,
      category: Category.STICKER,
      imageUrl: 'https://via.placeholder.com/400x400/2563EB/FFFFFF?text=Sticker+Pack',
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
  console.log('   - 23 Officers (Executive Board, Admin, Finance, Reps, Ambassadors)');
  console.log('   - 6 Events (2 Upcoming, 4 Past)');
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
