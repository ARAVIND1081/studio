
'use client';

import type { SiteSettings } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { getSiteSettings as fetchDataSettings, updateSiteSettings as updateDataSettings } from '@/lib/data';

interface SiteSettingsContextType {
  siteSettings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  isLoading: boolean;
}

const defaultInitialSettings: SiteSettings = {
  siteName: "ShopSphere",
  siteTagline: "Your premier destination for luxury and style.",
  contentManagementInfoText: "Manage your products, site settings, and page content from here.",
  homePageNoProductsTitle: "Our Shelves Are Being Restocked!",
  homePageNoProductsDescription: "We're currently updating our inventory with exciting new products. Please check back soon!",
  contactPageTitle: "Get In Touch",
  contactPageDescription: "We'd love to hear from you!",
  contactPagePhoneNumber: "",
  contactPageAddress: "",
  contactPageAdditionalInfo: "",
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultInitialSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      setIsLoading(true);
      const currentSettings = fetchDataSettings();
      setSiteSettings(currentSettings);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    const updated = updateDataSettings(newSettings); // Persist to localStorage via data.ts
    setSiteSettings(updated); // Update context state
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, updateSettings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
