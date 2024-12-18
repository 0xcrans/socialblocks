export const fetchTimeByBlockHeight = async (blockHeight) => {
    if (!blockHeight) return "";
    try {
      const res = await fetch(`https://api.near.social/time?blockHeight=${blockHeight}`);
      if (!res.ok) return "";
      const timeMs = parseFloat(await res.text());
      const date = new Date(timeMs);
      const dateNow = new Date();
      const diffSec = dateNow.getTime() - timeMs;
      
      if (diffSec < 60000) return `${(diffSec / 1000) | 0}s`;
      if (diffSec < 3600000) return `${(diffSec / 60000) | 0}m`;
      if (diffSec < 86400000) return `${(diffSec / 3600000) | 0}h`;
      return date.toLocaleString();
    } catch (error) {
      console.error("Error fetching time:", error);
      return "";
    }
  };