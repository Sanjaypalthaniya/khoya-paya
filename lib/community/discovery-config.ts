export const searchVocabulary: Record<string, string[]> = {
  mobile: ["phone", "phones", "mobiles", "cell phone", "smartphone", "smartphones", "iphone", "android", "handset"],
  wallet: ["wallets", "purse", "purses", "money bag", "card holder"],
  documents: ["document", "papers", "licence", "license", "driving licence", "dl", "id", "id card", "aadhaar", "passport"],
  pet: ["pets", "dog", "dogs", "cat", "cats", "puppy", "kitten"],
  bag: ["bags", "purse", "luggage", "backpack", "rucksack", "handbag"],
  keys: ["key", "keychain", "key ring"],
  vehicle: ["vehicles", "car", "cars", "bike", "bicycle", "scooter", "motorcycle"],
  electronics: ["electronic", "laptop", "tablet", "earbuds", "headphones", "watch", "smartwatch"],
  jewellery: ["jewelry", "jewel", "ring", "chain", "bracelet", "necklace"],
  "need help": ["help", "support", "assist", "assistance"],
};
export const trendingWeights = { reaction: 1, comment: 3, save: 2, share: 2, view: .1, recovered: 12, halfLifeHours: 72 } as const;
export const trustWeights = { accountAge: 10, profile: 10, verification: 20, helpfulComment: 1, successfulReturn: 12, verifiedReturn: 18, validReport: 3 } as const;
export const TRUST_DISCLAIMER = "Trust Score is based on platform activity and verified contributions. It does not guarantee identity or safety.";
