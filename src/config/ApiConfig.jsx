import { useState, useEffect } from "react";
import { isOnline } from "../utils/networkStatus"; // Import the network status utility

// Define default URLs for different services
const defaultAiApiUrl = "http://192.168.1.21:8000"; // Localized Python AI backend (offline endpoint)
const defaultBillingApiUrl = "https://xeoxvk3jxlmq9npf.vercel.app/"; // Vercel server for billing
const defaultHuggingFaceApiUrl = "https://api-inference.huggingface.co"; // Hugging Face inference API (online endpoint)

let aiApiUrl = defaultAiApiUrl;
let billingApiUrl = defaultBillingApiUrl;
let huggingFaceApiUrl = defaultHuggingFaceApiUrl;

// Functions to set and get AI API URL
export const setAiApiUrl = (newUrl) => {
  aiApiUrl = newUrl;
};

export const getAiApiUrl = () => aiApiUrl;

// Functions to set and get Billing API URL
export const setBillingApiUrl = (newUrl) => {
  billingApiUrl = newUrl;
};

export const getBillingApiUrl = () => billingApiUrl;

// Functions to set and get Hugging Face API URL
export const setHuggingFaceApiUrl = (newUrl) => {
  huggingFaceApiUrl = newUrl;
};

export const getHuggingFaceApiUrl = () => huggingFaceApiUrl;

// Hook to manage API URLs dynamically
export const useApiUrl = (service) => {
  const [currentApiUrl, setCurrentApiUrl] = useState(
    service === "billing"
      ? billingApiUrl
      : service === "huggingface"
      ? huggingFaceApiUrl
      : aiApiUrl
  );

  useEffect(() => {
    if (service === "billing") {
      setCurrentApiUrl(billingApiUrl);
      return;
    }

    const determineApiUrl = async () => {
      const online = await isOnline();
      if (online) {
        setCurrentApiUrl(huggingFaceApiUrl);
      } else {
        setCurrentApiUrl(aiApiUrl);
      }
    };

    if (service === "huggingface" || service === "ai") {
      determineApiUrl();
    }
  }, [service]);

  const updateApiUrl = (newUrl) => {
    if (service === "billing") {
      setBillingApiUrl(newUrl);
    } else if (service === "huggingface") {
      setHuggingFaceApiUrl(newUrl);
    } else {
      setAiApiUrl(newUrl);
    }
    setCurrentApiUrl(newUrl);
  };

  return [currentApiUrl, updateApiUrl];
};
