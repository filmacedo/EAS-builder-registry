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
