import { MetadataRoute } from "next";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  priority?: number;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}

export const sitemapItems: NavItem[] = [
  {
    title: "Experiments",
    href: "/experiments",
    description: "Manage and view your experiments",
    priority: 1,
    changeFrequency: "daily",
  },
  {
    title: "Models",
    href: "/models",
    description: "Browse and manage your machine learning models",
    priority: 0.9,
    changeFrequency: "daily",
  },
  {
    title: "Registry",
    href: "/registry",
    description: "Access the model registry",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    title: "Deployments",
    href: "/deployments",
    description: "Manage your model deployments",
    priority: 0.8,
    changeFrequency: "daily",
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Configure your account and application settings",
    priority: 0.5,
    changeFrequency: "monthly",
  },
];

// Function to generate XML sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

  return sitemapItems.map((item) => ({
    url: `${baseUrl}${item.href}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
