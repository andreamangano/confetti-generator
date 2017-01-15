'use strict';
import _ from 'lodash';
/*
  Object navigation. It stores the info of previous, next and current slide.
  You can also get the total of slides, the percentage progress and the
  overview url.
*/
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
  const total = slides.length;
  return {
    next,
    prev,
    current: {data: slides[index], index: index + 1},
    total,
    overview: 'index.html',
    hasNext: () => Boolean(next),
    hasPrev: () => Boolean(prev),
    percentage: Math.round((index + 1) * 100 / total)
  };
};
exports.create = create;
