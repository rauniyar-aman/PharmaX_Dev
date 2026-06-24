require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Antibiotics' },       update: {}, create: { name: 'Antibiotics',         icon: '🦠' } }),
    prisma.category.upsert({ where: { name: 'Pain Relief' },       update: {}, create: { name: 'Pain Relief',         icon: '💊' } }),
    prisma.category.upsert({ where: { name: 'Vitamins' },          update: {}, create: { name: 'Vitamins',            icon: '🌿' } }),
    prisma.category.upsert({ where: { name: 'Diabetes Care' },     update: {}, create: { name: 'Diabetes Care',       icon: '💉' } }),
    prisma.category.upsert({ where: { name: 'Cardiac Health' },    update: {}, create: { name: 'Cardiac Health',      icon: '❤️' } }),
    prisma.category.upsert({ where: { name: 'Skin Care' },         update: {}, create: { name: 'Skin Care',           icon: '✨' } }),
    prisma.category.upsert({ where: { name: 'Digestive Health' },  update: {}, create: { name: 'Digestive Health',    icon: '🫁' } }),
    prisma.category.upsert({ where: { name: 'Cold & Flu' },        update: {}, create: { name: 'Cold & Flu',          icon: '🤧' } }),
  ])

  const [antibiotics, painRelief, vitamins, diabetes, cardiac, skin, digestive, coldFlu] = categories
  console.log(`✓ ${categories.length} categories seeded`)

  // ── Medicines ───────────────────────────────────────────────────────────────
  const medicines = await Promise.all([
    prisma.medicine.create({ data: {
      name: 'Amoxicillin 500mg', brand: 'GlaxoSmithKline', type: 'Rx',
      price: 180, originalPrice: 220, categoryId: antibiotics.id,
      description: 'Broad-spectrum penicillin antibiotic for bacterial infections.',
      dosage: 'Adults: 250–500mg every 8 hours. Complete the full prescribed course.',
      usage: 'Take orally with or without food.',
      sideEffects: 'Nausea, diarrhea, skin rash. Seek help for severe allergic reactions.',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd.',
      packageSize: '10 Capsules/Strip', rating: 4.5, totalReviews: 124, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Paracetamol 500mg', brand: 'Cipla', type: 'OTC',
      price: 45, originalPrice: 55, categoryId: painRelief.id,
      description: 'Pain reliever and fever reducer for adults and children.',
      dosage: 'Adults: 500–1000mg every 4–6 hours. Max 4g/day.',
      usage: 'Take with water. Do not exceed recommended dose.',
      sideEffects: 'Rarely causes side effects at therapeutic doses.',
      manufacturer: 'Cipla Ltd.', packageSize: '10 Tablets/Strip',
      rating: 4.8, totalReviews: 389, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Vitamin D3 1000 IU', brand: 'Abbott', type: 'OTC',
      price: 320, originalPrice: 380, categoryId: vitamins.id,
      description: 'Supports bone health, immune function, and calcium absorption.',
      dosage: '1 tablet daily or as directed by physician.',
      usage: 'Take with food for better absorption.',
      sideEffects: 'Generally well tolerated. Hypercalcemia with excessive use.',
      manufacturer: 'Abbott Laboratories', packageSize: '30 Tablets/Bottle',
      rating: 4.6, totalReviews: 256, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Metformin 500mg', brand: 'Sun Pharma', type: 'Rx',
      price: 95, originalPrice: 120, categoryId: diabetes.id,
      description: 'First-line medication for type 2 diabetes management.',
      dosage: '500mg twice daily with meals, adjusted by physician.',
      usage: 'Take with meals to reduce gastrointestinal side effects.',
      sideEffects: 'Nausea, diarrhea, stomach upset — usually transient.',
      manufacturer: 'Sun Pharmaceutical Industries', packageSize: '10 Tablets/Strip',
      rating: 4.4, totalReviews: 178, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Cetirizine 10mg', brand: 'Cipla', type: 'OTC',
      price: 35, originalPrice: 45, categoryId: coldFlu.id,
      description: 'Antihistamine for allergy relief — non-drowsy formula.',
      dosage: '10mg once daily.',
      usage: 'May be taken with or without food.',
      sideEffects: 'Mild drowsiness, dry mouth in some patients.',
      manufacturer: 'Cipla Ltd.', packageSize: '10 Tablets/Strip',
      rating: 4.7, totalReviews: 312, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Omeprazole 20mg', brand: 'AstraZeneca', type: 'Rx',
      price: 140, originalPrice: 175, categoryId: digestive.id,
      description: 'Proton pump inhibitor for acid reflux and peptic ulcers.',
      dosage: '20mg once daily before breakfast.',
      usage: 'Swallow whole, do not crush or chew.',
      sideEffects: 'Headache, nausea, diarrhea, abdominal pain.',
      manufacturer: 'AstraZeneca Pharmaceuticals', packageSize: '14 Capsules/Pack',
      rating: 4.5, totalReviews: 203, inStock: false,
    }}),
    prisma.medicine.create({ data: {
      name: 'Lisinopril 10mg', brand: 'Merck', type: 'Rx',
      price: 210, originalPrice: 260, categoryId: cardiac.id,
      description: 'ACE inhibitor for hypertension and heart failure management.',
      dosage: '10mg once daily, titrated by physician.',
      usage: 'Take at the same time each day.',
      sideEffects: 'Dry cough, dizziness, elevated potassium.',
      manufacturer: 'Merck & Co., Inc.', packageSize: '30 Tablets/Bottle',
      rating: 4.3, totalReviews: 145, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Clotrimazole Cream 1%', brand: 'Bayer', type: 'OTC',
      price: 85, originalPrice: 100, categoryId: skin.id,
      description: 'Antifungal cream for skin infections like athlete\'s foot and ringworm.',
      dosage: 'Apply thin layer twice daily for 2–4 weeks.',
      usage: 'Clean and dry affected area before application.',
      sideEffects: 'Mild burning or itching at application site.',
      manufacturer: 'Bayer AG', packageSize: '20g Tube',
      rating: 4.6, totalReviews: 89, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Omega-3 Fish Oil 1000mg', brand: 'Nature Made', type: 'OTC',
      price: 420, originalPrice: 500, categoryId: vitamins.id,
      description: 'Supports heart health, brain function, and reduces inflammation.',
      dosage: '1–2 softgels daily with meals.',
      usage: 'Take with meals to reduce fishy aftertaste.',
      sideEffects: 'Fishy breath, mild GI discomfort.',
      manufacturer: 'Nature Made (Pharmavite)', packageSize: '60 Softgels/Bottle',
      rating: 4.8, totalReviews: 534, inStock: true,
    }}),
    prisma.medicine.create({ data: {
      name: 'Aspirin 75mg', brand: 'Bayer', type: 'OTC',
      price: 60, originalPrice: 80, categoryId: cardiac.id,
      description: 'Low-dose aspirin for cardiovascular event prevention.',
      dosage: '75mg once daily or as prescribed.',
      usage: 'Take with food to minimize stomach irritation.',
      sideEffects: 'GI bleeding risk, avoid in children under 16.',
      manufacturer: 'Bayer AG', packageSize: '28 Tablets/Pack',
      rating: 4.5, totalReviews: 298, inStock: true,
    }}),
  ])
  console.log(`✓ ${medicines.length} medicines seeded`)

  // ── Admin User ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 10)
  await prisma.user.upsert({
    where: { email: 'admin@pharmax.com' },
    update: {},
    create: {
      fullName: 'PharmaX Admin',
      email: 'admin@pharmax.com',
      passwordHash: adminHash,
      phone: '+977-9800000000',
      role: 'ADMIN',
    },
  })

  // ── Demo Customer ────────────────────────────────────────────────────────────
  const customerHash = await bcrypt.hash('Customer@1234', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'aman@example.com' },
    update: {},
    create: {
      fullName: 'Aman Rauniyar',
      email: 'aman@example.com',
      passwordHash: customerHash,
      phone: '+977-9800000001',
      bloodGroup: 'B+',
      gender: 'Male',
      role: 'CUSTOMER',
      addresses: {
        create: [
          {
            label: 'Home', name: 'Aman Rauniyar', phone: '+977-9800000001',
            address: '123 Lazimpat, Ward No. 2', city: 'Kathmandu',
            province: 'Bagmati Province', zip: '44600', isDefault: true,
          },
          {
            label: 'Office', name: 'Aman Rauniyar', phone: '+977-9800000001',
            address: '45 New Baneshwor', city: 'Kathmandu',
            province: 'Bagmati Province', zip: '44601', isDefault: false,
          },
        ],
      },
    },
  })
  console.log(`✓ 2 users seeded (admin + demo customer)`)

  console.log('\nDatabase seeded successfully.')
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
