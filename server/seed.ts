import { db } from "./db";
import { mobiles } from "@shared/schema";

const sampleMobiles = [
  {
    sellerId: "sample_seller",
    brand: "Apple",
    model: "iPhone 14 Pro",
    storage: "128GB",
    color: "Deep Purple",
    condition: "excellent",
    price: "85000",
    originalPrice: "95000",
    discountPercentage: 10,
    description: "Like new iPhone 14 Pro with all original accessories. No scratches or dents. Battery health 98%.",
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-deep-purple-select?wid=470&hei=556&fmt=png-alpha&.v=1660753293379",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-back-deep-purple-select?wid=470&hei=556&fmt=png-alpha&.v=1660753293616"
    ],
    isNew: false,
    featured: true,
    offerText: "Limited Time Offer",
    status: "approved",
    location: "Mumbai",
    specifications: {
      ram: "6GB",
      processor: "A16 Bionic",
      camera: "48MP Triple Camera",
      display: "6.1-inch Super Retina XDR"
    },
    accessories: ["Original Box", "Charger", "EarPods", "Screen Protector"]
  },
  {
    sellerId: "sample_seller",
    brand: "Samsung",
    model: "Galaxy S23 Ultra",
    storage: "256GB",
    color: "Phantom Black",
    condition: "excellent",
    price: "75000",
    originalPrice: "82000",
    discountPercentage: 8,
    description: "Samsung Galaxy S23 Ultra in pristine condition. S Pen included. Perfect for photography enthusiasts.",
    images: [
      "https://images.samsung.com/is/image/samsung/p6pim/in/2302/gallery/in-galaxy-s23-ultra-s918-sm-s918bzkcins-534858085?$650_519_PNG$",
      "https://images.samsung.com/is/image/samsung/p6pim/in/2302/gallery/in-galaxy-s23-ultra-s918-sm-s918bzkcins-534858089?$650_519_PNG$"
    ],
    isNew: false,
    featured: true,
    offerText: "Best Price Guaranteed",
    status: "approved",
    location: "Delhi",
    specifications: {
      ram: "12GB",
      processor: "Snapdragon 8 Gen 2",
      camera: "200MP Quad Camera",
      display: "6.8-inch Dynamic AMOLED 2X"
    },
    accessories: ["Original Box", "S Pen", "Fast Charger", "Case"]
  },
  {
    sellerId: "sample_seller",
    brand: "OnePlus",
    model: "OnePlus 11",
    storage: "128GB",
    color: "Titan Black",
    condition: "good",
    price: "45000",
    originalPrice: "52000",
    discountPercentage: 13,
    description: "OnePlus 11 with flagship performance. Minor wear on corners but fully functional.",
    images: [
      "https://oasis.opstatics.com/content/dam/oasis/page/2023/global/products/11/pc/kv/11-black-kv-pc.png",
      "https://oasis.opstatics.com/content/dam/oasis/page/2023/global/products/11/pc/design/11-black-design-pc.png"
    ],
    isNew: false,
    featured: false,
    offerText: "Great Deal",
    status: "approved",
    location: "Bangalore",
    specifications: {
      ram: "8GB",
      processor: "Snapdragon 8 Gen 2",
      camera: "50MP Triple Camera",
      display: "6.7-inch Fluid AMOLED"
    },
    accessories: ["Original Box", "Fast Charger"]
  },
  {
    sellerId: "sample_seller",
    brand: "Xiaomi",
    model: "Mi 13 Pro",
    storage: "256GB",
    color: "Ceramic White",
    condition: "excellent",
    price: "55000",
    originalPrice: "62000",
    discountPercentage: 11,
    description: "Mi 13 Pro with Leica camera system. Excellent photography capabilities and fast charging.",
    images: [
      "https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1676020415.50722073.png",
      "https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1676020419.32257987.png"
    ],
    isNew: false,
    featured: true,
    offerText: "Leica Camera Special",
    status: "approved",
    location: "Pune",
    specifications: {
      ram: "12GB",
      processor: "Snapdragon 8 Gen 2",
      camera: "50MP Leica Triple Camera",
      display: "6.73-inch LTPO AMOLED"
    },
    accessories: ["Original Box", "120W Fast Charger", "Case"]
  },
  {
    sellerId: "sample_seller",
    brand: "Google",
    model: "Pixel 7 Pro",
    storage: "128GB",
    color: "Obsidian",
    condition: "excellent",
    price: "48000",
    originalPrice: "54000",
    discountPercentage: 11,
    description: "Google Pixel 7 Pro with pure Android experience. Amazing camera with computational photography.",
    images: [
      "https://lh3.googleusercontent.com/yD6f3FWIcDgU8bJl-mHjXJ25_nG5xF-V_5O9tBqN7MBh1nKbE0_zHnYyCEI7WaKUYA",
      "https://lh3.googleusercontent.com/ySF1xFhiPJnl2j-5tZjHNmx1d7wKGk_E_dXQXdNQKOq5LlKfT7jH2dCj8mNtYzWbYA"
    ],
    isNew: false,
    featured: false,
    offerText: "Pure Android Experience",
    status: "approved",
    location: "Chennai",
    specifications: {
      ram: "12GB",
      processor: "Google Tensor G2",
      camera: "50MP Triple Camera",
      display: "6.7-inch LTPO OLED"
    },
    accessories: ["Original Box", "USB-C Cable", "Case"]
  }
];

export async function seedMobiles() {
  try {
    console.log("Seeding mobile data...");
    
    for (const mobile of sampleMobiles) {
      await db.insert(mobiles).values(mobile).onConflictDoNothing();
    }
    
    console.log("Mobile data seeded successfully!");
  } catch (error) {
    console.error("Error seeding mobile data:", error);
  }
}