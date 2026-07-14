type VerificationItem = { category: string; itemName?: string; brand?: string | null; modelNumber?: string | null };

const common = ["Item kis location par mila?", "Item par koi unique mark, scratch ya sticker hai?"];
const banks: Record<string, string[]> = {
  mobile: ["Phone ka cover kis color ka hai?", "Lock screen wallpaper me kya photo ya design hai?", "Phone kis brand/model ka lag raha hai?", "Phone par koi scratch, crack ya sticker hai?", "Phone kis location par mila?"],
  phone: ["Phone ka cover kis color ka hai?", "Lock screen wallpaper me kya photo ya design hai?", "Phone kis brand/model ka lag raha hai?", "Phone par koi scratch, crack ya sticker hai?", "Phone kis location par mila?"],
  laptop: ["Laptop kis brand ka hai?", "Laptop par koi sticker/logo/mark laga hai?", "Laptop ka color kya hai?", "Laptop ke saath charger ya bag bhi mila?", "Laptop kis jagah mila?"],
  bag: ["Bag ka color kya hai?", "Bag ke andar kaunse items hain?", "Bag par koi brand/logo/name tag hai?", "Bag me books, documents ya clothes hain?", "Bag kis location par mila?"],
  wallet: ["Wallet ka color/material kya hai?", "Wallet ke andar kaunse cards/items hain?", "Wallet me cash tha ya nahi?", "Wallet par koi brand/logo hai?", "Wallet kis jagah mila?"],
  keys: ["Keychain kaisa hai?", "Kitni keys hain?", "Keychain par koi name/logo/tag hai?", "Keys kis jagah mili?", "Kya key ke saath remote/card attached hai?"],
  documents: ["Document kis type ka hai?", "Document par naam ya institute/company ka detail hai?", "Document folder/file ka color kya hai?", "Document kis jagah mila?", "Document ke saath koi aur paper tha?"],
  pet: ["Pet kis type ka hai?", "Pet ka color/breed kya hai?", "Collar/tag par kya likha hai?", "Pet kahan mila?", "Pet ke behavior ya unique mark kya hai?"],
  "travel luggage": ["Bag/suitcase ka color kya hai?", "Bag par koi tag/sticker/lock hai?", "Bag ke andar kya items hain?", "Bag kis station/airport/location par mila?", "Bag ka brand/model kya hai?"],
};

export function getVerificationQuestionsForItem(item: VerificationItem) {
  return banks[item.category.toLowerCase()] ?? ["Item ka color kya hai?", ...common, "Item ke saath koi aur cheez mili?", "Item ka brand/model kya hai?"];
}
