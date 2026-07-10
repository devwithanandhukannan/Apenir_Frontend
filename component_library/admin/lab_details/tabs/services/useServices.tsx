import { useState, useEffect, useMemo } from "react";

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  tatHours: number;
  isAvailable: boolean;
}

export interface PackageItem {
  id: string;
  name: string;
  testCount: number;
  price: number;
  tatHours: number;
  isAvailable: boolean;
  description: string;
}

export const useServices = (labId: string) => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const mockServices: ServiceItem[] = [
        {
          id: "srv-1",
          name: "Complete Blood Count (CBC)",
          category: "Blood Test",
          price: 350,
          tatHours: 12,
          isAvailable: true,
        },
        {
          id: "srv-2",
          name: "Lipid Profile (Cholesterol)",
          category: "Blood Test",
          price: 850,
          tatHours: 24,
          isAvailable: true,
        },
        {
          id: "srv-3",
          name: "Thyroid Profile (T3, T4, TSH)",
          category: "Blood Test",
          price: 900,
          tatHours: 24,
          isAvailable: true,
        },
        {
          id: "srv-4",
          name: "Electrocardiogram (ECG)",
          category: "Cardiology",
          price: 600,
          tatHours: 4,
          isAvailable: true,
        },
        {
          id: "srv-5",
          name: "Chest X-Ray",
          category: "Imaging",
          price: 1200,
          tatHours: 6,
          isAvailable: false,
        },
      ];

      const mockPackages: PackageItem[] = [
        {
          id: "pkg-1",
          name: "Executive Health Checkup",
          testCount: 64,
          price: 4999,
          tatHours: 36,
          isAvailable: true,
          description:
            "Comprehensive evaluation of body systems including cardiac, liver, thyroid, kidney, and diabetic profiles.",
        },
        {
          id: "pkg-2",
          name: "Active Woman Wellness Pack",
          testCount: 48,
          price: 2999,
          tatHours: 24,
          isAvailable: true,
          description:
            "Focused wellness screen containing CBC, hormone profiles, bone density calcium markers, and iron parameters.",
        },
        {
          id: "pkg-3",
          name: "Senior Citizen Health Screening",
          testCount: 52,
          price: 3499,
          tatHours: 24,
          isAvailable: true,
          description:
            "Custom screen looking at age-related metrics, geriatric metabolic indexes, and arthritis parameters.",
        },
      ];

      setServices(mockServices);
      setPackages(mockPackages);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [labId]);

  const filteredServices = useMemo(() => {
    return services.filter((srv) =>
      srv.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [services, search]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [packages, search]);

  return {
    services: filteredServices,
    packages: filteredPackages,
    loading,
    search,
    setSearch,
  };
};

export default useServices;
