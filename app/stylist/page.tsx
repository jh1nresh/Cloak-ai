import type { Metadata } from "next";
import StylistDashboard from "@/components/style/StylistDashboard";
import { dropProducts } from "@/lib/drop-products";

export const metadata: Metadata = {
  title: "Your Cloak Stylist",
  description: "Personalized fashion recommendations from your saved Cloak style profile.",
};

export default function StylistPage() {
  return <StylistDashboard products={dropProducts} />;
}
