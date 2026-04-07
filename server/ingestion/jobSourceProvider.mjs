import { createJobPosting, validateJobPosting } from "../models/jobPosting.mjs";

export function createJobSourceProvider({ name, mapRawPosting }) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Provider `name` is required.");
  }

  if (typeof mapRawPosting !== "function") {
    throw new Error("Provider `mapRawPosting` must be a function.");
  }

  const providerName = name.trim();

  return Object.freeze({
    name: providerName,
    normalize(rawPosting) {
      const mappedPosting = mapRawPosting(rawPosting);

      if (!mappedPosting || typeof mappedPosting !== "object" || Array.isArray(mappedPosting)) {
        throw new Error("Provider `mapRawPosting` must return an object.");
      }

      const jobPosting = createJobPosting({
        ...mappedPosting,
        source: mappedPosting.source ?? providerName,
      });

      return {
        jobPosting,
        validation: validateJobPosting(jobPosting),
      };
    },
  });
}
