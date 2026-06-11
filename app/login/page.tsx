import type { Metadata } from "next";
import StyleOnboarding from "@/components/style/StyleOnboarding";

export const metadata: Metadata = {
  title: "Create Your Cloak Stylist",
  description: "Create a local style profile so Cloak can recommend pieces without repeated uploads.",
};

export default function LoginPage() {
  return <StyleOnboarding />;
}
