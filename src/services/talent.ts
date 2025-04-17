const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const BATCH_SIZE = 50;
const BATCH_DELAY = 500;

async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(fetchFn, retries - 1);
    }
    throw error;
  }
}

export async function getTalentScore(address: string): Promise<number | null> {
  return fetchWithRetry(async () => {
    try {
      const response = await fetch(`/api/talent?address=${address}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.score?.points || null;
    } catch (error) {
      console.warn(
        `Error fetching Talent Protocol score for ${address}:`,
        error
      );
      return null;
    }
  });
}

export interface TalentProfile {
  name: string | null;
  display_name: string | null;
  image_url: string | null;
}

export async function getTalentProfile(
  address: string
): Promise<TalentProfile | null> {
  return fetchWithRetry(async () => {
    try {
      const response = await fetch(`/api/talent/profile?address=${address}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        name: data.profile?.name || null,
        display_name: data.profile?.display_name || null,
        image_url: data.profile?.image_url || null,
      };
    } catch (error) {
      console.warn(
        `Error fetching Talent Protocol profile for ${address}:`,
        error
      );
      return null;
    }
  });
}

export async function getTalentDataBatch(
  addresses: string[]
): Promise<
  Map<string, { score: number | null; profile: TalentProfile | null }>
> {
  const result = new Map<
    string,
    { score: number | null; profile: TalentProfile | null }
  >();

  // Process addresses in batches
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batch = addresses.slice(i, i + BATCH_SIZE);

    // Process score and profile in parallel for the entire batch
    const [scores, profiles] = await Promise.all([
      Promise.all(batch.map((address) => getTalentScore(address))),
      Promise.all(batch.map((address) => getTalentProfile(address))),
    ]);

    // Map results back to addresses
    batch.forEach((address, index) => {
      result.set(address, {
        score: scores[index],
        profile: profiles[index],
      });
    });

    // Add reduced delay between batches
    if (i + BATCH_SIZE < addresses.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
    }
  }

  return result;
}
