
import { eq } from "drizzle-orm";
import {db} from "./server/db.ts"
import {users , mobiles , rechargeTransactions , orders , favorites} from './shared/schema.ts'
async function seed() {
  console.log("🌱 Seeding started...");

  // Create users
  const [user1, user2] = await db
    .insert(users)
    .values([
      {
        id: "user_1",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "user",
        profileImageUrl: "https://www.gstatic.com/webp/gallery3/1.png",
      },
      {
        id: "user_2",
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Smith",
        role: "user",
        profileImageUrl: "https://www.gstatic.com/webp/gallery3/2.png",
      },
    ])
    .returning();

  // Create mobiles
  const [mobile1, mobile2] = await db
    .insert(mobiles)
    .values([
      {
        sellerId: user1.id,
        brand: "Apple",
        model: "iPhone 13 Pro",
        storage: "256GB",
        color: "Sierra Blue",
        condition: "excellent",
        price: "799.99",
        originalPrice: "999.99",
        discountPercentage: 20,
        description: "Barely used iPhone 13 Pro in excellent condition.",
        images: JSON.stringify([
          "https://www.gstatic.com/webp/gallery3/3.png",
          "https://www.gstatic.com/webp/gallery3/4.png",
        ]),
        isNew: false,
        featured: true,
        offerText: "Limited Time Offer!",
        status: "approved",
        location: "New York",
        specifications: JSON.stringify({
          RAM: "6GB",
          Processor: "A15 Bionic",
        }),
        accessories: JSON.stringify(["Charger", "Box"]),
      },
      {
        sellerId: user2.id,
        brand: "Samsung",
        model: "Galaxy S22 Ultra",
        storage: "512GB",
        color: "Phantom Black",
        condition: "good",
        price: "699.99",
        originalPrice: "1099.99",
        discountPercentage: 36,
        description: "Galaxy S22 Ultra with minor scratches.",
        images: JSON.stringify([
          "https://www.gstatic.com/webp/gallery3/5.png",
        ]),
        isNew: false,
        featured: false,
        offerText: "Big Discount!",
        status: "approved",
        location: "San Francisco",
        specifications: JSON.stringify({
          RAM: "12GB",
          Processor: "Snapdragon 8 Gen 1",
        }),
        accessories: JSON.stringify(["Charger"]),
      },
    ])
    .returning();

  // Recharge Transactions
  await db.insert(rechargeTransactions).values([
    {
      userId: user1.id,
      mobileNumber: "9876543210",
      operator: "jio",
      planType: "prepaid",
      amount: "299.00",
      planDetails: JSON.stringify({
        validity: "28 days",
        data: "2GB/day",
      }),
      transactionId: "TXN001",
      status: "success",
      paymentMethod: "upi",
    },
    {
      userId: user2.id,
      mobileNumber: "9123456780",
      operator: "airtel",
      planType: "postpaid",
      amount: "499.00",
      planDetails: JSON.stringify({
        validity: "Monthly",
        data: "Unlimited",
      }),
      transactionId: "TXN002",
      status: "success",
      paymentMethod: "card",
    },
  ]);

  // Favorites
  await db.insert(favorites).values([
    {
      userId: user1.id,
      mobileId: mobile2.id,
    },
    {
      userId: user2.id,
      mobileId: mobile1.id,
    },
  ]);

  // Orders
  await db.insert(orders).values([
    {
      buyerId: user1.id,
      sellerId: user2.id,
      mobileId: mobile2.id,
      amount: "699.99",
      status: "confirmed",
      paymentMethod: "wallet",
      paymentStatus: "success",
      shippingAddress: JSON.stringify({
        line1: "123 Main St",
        city: "New York",
        zip: "10001",
        state: "NY",
        country: "USA",
      }),
    },
    {
      buyerId: user2.id,
      sellerId: user1.id,
      mobileId: mobile1.id,
      amount: "799.99",
      status: "shipped",
      paymentMethod: "card",
      paymentStatus: "success",
      shippingAddress: JSON.stringify({
        line1: "456 Elm St",
        city: "San Francisco",
        zip: "94102",
        state: "CA",
        country: "USA",
      }),
    },
  ]);

  console.log("✅ Seeding completed.");
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
