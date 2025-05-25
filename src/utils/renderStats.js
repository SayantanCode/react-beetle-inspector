export const globalRenderStats = new Map();

export const getRenderStats = () => {
  return [...globalRenderStats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
};