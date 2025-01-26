import { calculateKFactor } from './utils';

describe('calculateKFactor', () => {
  it('should return 40 for a player with less than 10 matches played', () => {
    const player = { totalMatchesPlayed: 5, rating: 1500 };
    expect(calculateKFactor(player)).toBe(40);
  });

  it('should return 30 for a player with between 10 and 25 matches played and a rating less than 1500', () => {
    const player = { totalMatchesPlayed: 15, rating: 1200 };
    expect(calculateKFactor(player)).toBe(30);
  });

  it('should return 25 for a player with between 10 and 25 matches played and a rating greater than or equal to 1500', () => {
    const player = { totalMatchesPlayed: 20, rating: 1800 };
    expect(calculateKFactor(player)).toBe(25);
  });

  it('should return 20 for a player with more than 25 matches played and a rating less than 1800', () => {
    const player = { totalMatchesPlayed: 30, rating: 1600 };
    expect(calculateKFactor(player)).toBe(20);
  });

  it('should return 15 for a player with more than 25 matches played and a rating greater than or equal to 1800', () => {
    const player = { totalMatchesPlayed: 40, rating: 2000 };
    expect(calculateKFactor(player)).toBe(15);
  });
});