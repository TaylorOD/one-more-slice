// These dimensions are shared by the oven model and its animation so the peel
// clears the opening and rests above the stone instead of passing through fire.
export const ovenLayout = {
  centerZ: -4.5,
  mouthZ: -2.8,
  openingHalfWidth: 1.8,
  deckTop: 0.81,
  flameTop: 0.57,
  peelRadius: 2.65,
  peelBottom: -0.18,
  bakingHeight: 0.93,
  bakingScale: 0.62
};

const smooth = (value) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function bakingPose(progress) {
  const lift = progress < 0.88 ? smooth(progress / 0.12) : 1 - smooth((progress - 0.88) / 0.12);
  const slide =
    progress < 0.76 ? smooth((progress - 0.12) / 0.15) : 1 - smooth((progress - 0.76) / 0.12);
  return {
    y: ovenLayout.bakingHeight * lift,
    z: slide === 0 ? 0 : ovenLayout.centerZ * slide,
    scale: 1 - (1 - ovenLayout.bakingScale) * lift
  };
}
