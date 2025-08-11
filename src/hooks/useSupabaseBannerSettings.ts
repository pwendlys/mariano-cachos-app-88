
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BannerImageMeta = {
  crop?: { x: number; y: number };
  zoom?: number;
  aspect?: number;
};

export interface BannerSettingsWithMeta {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  isVisible: boolean;
  image?: string | null; // compat para UI (mapeia image_url)
  logo?: string | null;  // compat para UI (mapeia logo_url)
  imageUrl?: string | null; // direto do Supabase
  logoUrl?: string | null;
  imageMeta?: BannerImageMeta;
  logoMeta?: BannerImageMeta;
}

const DEFAULTS: BannerSettingsWithMeta = {
  id: "main-banner",
  title: "Marcos Mariano",
  subtitle: "Expert em Crespos e Cacheados",
  description:
    "Sua beleza natural merece ser celebrada. Aqui, cada cacho tem sua história e personalidade única.",
  isVisible: true,
  image: null,
  logo: null,
  imageUrl: null,
  logoUrl: null,
  imageMeta: { crop: { x: 0, y: 0 }, zoom: 1, aspect: 2 },
  logoMeta: {},
};

export function useSupabaseBannerSettings() {
  const [banner, setBanner] = useState<BannerSettingsWithMeta>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("banner_settings")
        .select("*")
        .eq("id", "main-banner")
        .single();

      if (error) {
        console.warn("Banner settings not found or error, using defaults", error);
      }

      if (mounted) {
        if (data) {
          const mapped: BannerSettingsWithMeta = {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            isVisible: data.is_visible,
            image: data.image_url,
            logo: data.logo_url,
            imageUrl: data.image_url,
            logoUrl: data.logo_url,
            imageMeta: data.image_meta || { crop: { x: 0, y: 0 }, zoom: 1, aspect: 2 },
            logoMeta: data.logo_meta || {},
          };
          setBanner(mapped);
        } else {
          setBanner(DEFAULTS);
        }
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updateBannerSettings = async (updates: Partial<BannerSettingsWithMeta>) => {
    const next = { ...banner, ...updates };
    setBanner(next);

    const payload = {
      id: "main-banner",
      title: next.title,
      subtitle: next.subtitle,
      description: next.description,
      is_visible: next.isVisible,
      image_url: next.imageUrl ?? next.image ?? null,
      logo_url: next.logoUrl ?? next.logo ?? null,
      image_meta: next.imageMeta ?? {},
      logo_meta: next.logoMeta ?? {},
    };

    const { data, error } = await supabase
      .from("banner_settings")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar banner_settings:", error);
      throw error;
    }

    const mapped: BannerSettingsWithMeta = {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      isVisible: data.is_visible,
      image: data.image_url,
      logo: data.logo_url,
      imageUrl: data.image_url,
      logoUrl: data.logo_url,
      imageMeta: data.image_meta || {},
      logoMeta: data.logo_meta || {},
    };
    setBanner(mapped);
    return mapped;
  };

  return { banner, loading, updateBannerSettings };
}
