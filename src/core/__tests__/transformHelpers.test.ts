import { rotate90CW } from '../transformHelpers';

describe('rotate90CW', () => {
  it('should return matrix 90 degrees clockwise', () => {
    const z_shape = [
      [1, 1, 0],
      [0, 1, 1],
    ];
    const expected_z_shape = [
      [0, 1],
      [1, 1],
      [1, 0],
    ];

    const result = rotate90CW(z_shape);
    expect(result).toEqual(expected_z_shape);
  });
});
