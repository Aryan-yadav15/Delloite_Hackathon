'use client'

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useManufacturer() {
  const { user, isLoaded } = useUser();
  const [manufacturer, setManufacturer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  useEffect(() => {
    async function fetchManufacturer() {
      if (!user) return;

      try {
        const response = await fetch('/api/manufacturers');
        const data = await response.json();

        if (response.ok) {
          setManufacturer(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded) {
      fetchManufacturer();
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (needsRefresh) {
      fetchManufacturer();
      setNeedsRefresh(false);
    }
  }, [needsRefresh]);

  return {
    manufacturer,
    isLoading: !isLoaded || isLoading,
    error,
    refresh: () => setNeedsRefresh(true)
  };
} 