'use strict';
import _ from 'lodash';
const create = (slides, index) => {
  if (!_.isInteger(index)) {
    throw new Error('Index must be a finite number');
  }
  const next = (index + 1) < slides.length
    ? {data: slides[index + 1], index: index + 2}
    : null;
  const prev = (index - 1) >= 0
    ? {data: slides[index - 1], index: index - 2}
    : null;
  return {
    next,
    prev,
    current: {data: slides[index], index: index + 1},
    total: slides.length,
    overview: '/',
    hasNext: () => Boolean(next),
    hasPrev: () => Boolean(prev)
  };
};
exports.create = create;
