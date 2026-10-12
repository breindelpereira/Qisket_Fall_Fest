/**
 * Loss Budget Lab: photons are lost, not flipped. Each component passes a fraction of the light, losses multiply (and so
 * decibels add), and a computation that needs n photons to all arrive has to survive that n times over.
 * Assumes identical, independent components, which no real chip is: the lab says so.
 */

/** Decibels of loss to the fraction of light that gets through: 3 dB is about one half, 10 dB is one tenth. */
export const transmission = (lossDb: number): number => Math.pow(10, -Math.max(0, lossDb) / 10);

/** The other way round: the loss in dB of a given transmission (0 < t <= 1). */
export const lossDb = (t: number): number => (t > 0 ? -10 * Math.log10(Math.min(1, t)) : Infinity);

/** Total loss of a chain of components: the decibels simply add up. */
export const chainLossDb = (perComponentDb: number, components: number): number => Math.max(0, perComponentDb) * Math.max(0, components);

/** The chance that one photon makes it through the whole chain. */
export const photonSurvival = (perComponentDb: number, components: number): number =>
  transmission(chainLossDb(perComponentDb, components));

/** The chance that ALL n photons survive, when each is lost independently. */
export const allSurvive = (perComponentDb: number, components: number, photons: number): number =>
  Math.pow(photonSurvival(perComponentDb, components), Math.max(0, photons));

/** How many tries on average it takes for the whole thing to work (infinite if it never can). */
export const expectedAttempts = (success: number): number => (success > 0 ? 1 / success : Infinity);

/** The largest number of components that keeps the all-survive chance at or above `target`. */
export function maxComponents(perComponentDb: number, photons: number, target: number): number {
  if (!(perComponentDb > 0) || photons <= 0) return Infinity;
  if (!(target > 0 && target < 1)) return target >= 1 ? 0 : Infinity;
  // photons * perComponentDb * k / 10 <= -log10(target)
  return Math.floor((-10 * Math.log10(target)) / (photons * perComponentDb));
}
