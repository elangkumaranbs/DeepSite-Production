"use client";

import { File } from "@/lib/type";

export const searchMentions = async (query: string) => {
  const promises = [searchModels(query), searchDatasets(query)];
  const results = await Promise.all(promises);
  return { models: results[0], datasets: results[1] };
};

const searchModels = async (query: string) => {
  const response = await fetch(
    `https://huggingface.co/api/quicksearch?q=${query}&type=model&limit=3`
  );
  const data = await response.json();
  return data?.models ?? [];
};

const searchDatasets = async (query: string) => {
  const response = await fetch(
    `https://huggingface.co/api/quicksearch?q=${query}&type=dataset&limit=3`
  );
  const data = await response.json();
  return data?.datasets ?? [];
};

export const searchFilesMentions = async (query: string, files: File[]) => {
  if (!query) return files;
  const lowerQuery = query.toLowerCase();
  return files.filter((file) => file.path.toLowerCase().includes(lowerQuery));
};
