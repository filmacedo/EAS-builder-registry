export async function getTalentScore(address: string): Promise<number | null> {
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
    return data.score.points || null;
  } catch (error) {
    console.error("Error fetching Talent Protocol score:", error);
    return null;
  }
}

export interface TalentProfile {
  name: string | null;
  display_name: string | null;
  image_url: string | null;
}

export async function getTalentProfile(
  address: string
): Promise<TalentProfile | null> {
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
    console.error("Error fetching Talent Protocol profile:", error);
    return null;
  }
}
