import { Smartphone, Tablet, Headphones, Battery, Cable, Shield, Package } from "lucide-react";

export const categories = [
  { id: "android", name: "Smartphone Android", icon: Smartphone, slug: "android" },
  { id: "iphone", name: "Apple iPhone", icon: Smartphone, slug: "iphone" },
  { id: "ipad", name: "Apple iPad", icon: Tablet, slug: "ipad" },
  { id: "case", name: "Case & Pelindung", icon: Shield, slug: "case" },
  { id: "charger", name: "Charger & Adaptor", icon: Battery, slug: "charger" },
  { id: "kabel", name: "Kabel USB", icon: Cable, slug: "kabel" },
  { id: "audio", name: "Earphone & Audio", icon: Headphones, slug: "audio" },
  { id: "powerbank", name: "Power Bank", icon: Battery, slug: "powerbank" },
  { id: "tempered", name: "Tempered Glass", icon: Shield, slug: "tempered" },
  { id: "aksesori", name: "Aksesori Lainnya", icon: Package, slug: "aksesori" },
];
