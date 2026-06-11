import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database…')

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin1234', 12)
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@maison-eburne.fr' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@maison-eburne.fr',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Éburne',
      role: 'ADMIN',
    },
  })

  const products = [
    {
      name: 'Parka Officier',
      slug: 'parka-officier',
      description: 'Inspirée des grandes manœuvres militaires, cette parka restructurée allie technicité et élégance urbaine. Laine bouillie double face, doublure en viscose, boutons de nacre noire. Une pièce de caractère taillée pour durer.',
      price: 59000,
      category: 'Manteaux',
      isLimited: true,
      images: [],
      variants: ['XS', 'S', 'M', 'L', 'XL'],
      stock: [2, 4, 6, 4, 2],
    },
    {
      name: 'Hoodie Néoclassique',
      slug: 'hoodie-neoclassique',
      description: 'La rencontre du sweat-shirt et du drapé couture. Molleton épais 400g/m², coupe oversize calculée, coutures surpiquées à la main. Le quotidien élevé au rang d\'art.',
      price: 28000,
      category: 'Hauts',
      isLimited: true,
      images: [],
      variants: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      stock: [3, 5, 8, 8, 5, 2],
    },
    {
      name: 'Cargo Structuré',
      slug: 'cargo-structure',
      description: 'Le pantalon cargo réinventé par la maison. Toile de coton japonaise 280g, poches soufflets à rabat, taille réglable par cordon tressé. Entre utilitaire et sculpture.',
      price: 34000,
      category: 'Bas',
      isLimited: true,
      images: [],
      variants: ['36', '38', '40', '42', '44', '46'],
      stock: [2, 4, 6, 6, 4, 2],
    },
    {
      name: 'Manteau Grand Voyageur',
      slug: 'manteau-grand-voyageur',
      description: 'Le pièce maîtresse de la collection SS25. Cachemire et laine vierge, coupe longue architecturale, col officier plongeant. Fait pour traverser les saisons et les années.',
      price: 89000,
      category: 'Manteaux',
      isLimited: true,
      images: [],
      variants: ['XS', 'S', 'M', 'L', 'XL'],
      stock: [1, 2, 3, 2, 1],
    },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        category: p.category,
        isLimited: p.isLimited,
        images: p.images,
      },
    })

    for (let i = 0; i < p.variants.length; i++) {
      await prisma.variant.upsert({
        where: { productId_size: { productId: product.id, size: p.variants[i] } },
        update: { stock: p.stock[i] },
        create: { productId: product.id, size: p.variants[i], stock: p.stock[i] },
      })
    }

    console.log(`✓ ${product.name}`)
  }

  console.log('Seed terminé.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
