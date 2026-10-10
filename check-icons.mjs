import * as l from "lucide-react";

const icons = [
  "Search",
  "ShoppingCart",
  "Menu",
  "X",
  "BadgeCheck",
  "Truck",
  "ShieldCheck",
  "Headphones",
  "Cable",
  "Tablet",
  "Package",
  "Camera",
  "ThumbsUp",
  "Smartphone",
  "Battery",
  "Shield",
  "MapPin",
  "Phone",
  "Clock",
  "MessageCircle",
  "ChevronLeft",
];

icons.forEach((name) => {
  console.log(name.padEnd(20), name in l ? "✅" : "❌ MISSING");
});
