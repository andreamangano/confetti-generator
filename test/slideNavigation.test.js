'use strict';
import slideNavigation from './../src/lib/slideNavigation';
describe('SlideNavigation', function() {
  const slides = [
    {title: 'Slide1'},
    {title: 'Slide2'},
    {title: 'Slide3'}
  ];
  const expectedValues = [
    {
      prev: null,
      current: {data: slides[0], index: 1},
      next: {data: slides[1], index: 2},
      hasNext: true,
      hasPrev: false
    },
    {
      prev: {data: slides[0], index: 1},
      current: {data: slides[1], index: 2},
      next: {data: slides[2], index: 3},
      hasNext: true,
      hasPrev: true
    },
    {
      prev: {data: slides[1], index: 2},
      current: {data: slides[2], index: 3},
      next: null,
      hasNext: false,
      hasPrev: true
    }
  ];
  describe('constructor( slides, index, isPrimary, lan )', function() {
    const _wrongIndexValues = [Infinity, -Infinity, '10', 0.1];
    for(let i = 0; i < _wrongIndexValues.length; i++) {
      it(`given "${_wrongIndexValues[i]}" as index value, should throw`, function() {
        (function() {
          slideNavigation.create(slides, _wrongIndexValues[i]);
        }).should.throw(Error);
      });
    }
  });
  describe('next', function() {
    for(let i = 0; i < expectedValues.length; i++) {
      it(`given index ${i}, should work as expected`, function() {
        const nav = slideNavigation.create(slides, i);
        if (i == expectedValues.length)
          should.equal(nav.next, expectedValues[i].next);
        if (expectedValues[i].next !== null) {
          should.equal(nav.next.data, expectedValues[i].next.data);
          should.equal(nav.next.index, i + 2);
        }
      });
    }
  });
  describe('prev', function() {
    for(let i = 0; i < expectedValues.length; i++) {
      it(`given index ${i}, should work as expected`, function() {
        const nav = slideNavigation.create(slides, i);
        if (i == 0)
          should.equal(nav.prev, expectedValues[i].prev);
        if (expectedValues[i].prev !== null) {
          should.equal(nav.prev.data, expectedValues[i].prev.data);
          should.equal(nav.prev.index, i - 2);
        }
      });
    }
  });
  describe('current', function() {
    let nav;
    for(let i = 0; i < expectedValues.length; i++) {
      it(`given index ${i}, should work as expected`, function() {
        nav = slideNavigation.create(slides, i);
        should.equal(nav.current.data, expectedValues[i].current.data);
        should.equal(nav.current.index, i + 1);
      });
    }
  });
  describe('hasNext', function() {
    let nav;
    for(let i = 0; i < expectedValues.length; i++) {
      it(`given index ${i}, should work as expected`, function() {
        nav = slideNavigation.create(slides, i);
        should.equal(nav.hasNext(), expectedValues[i].hasNext);
      });
    }
  });
  describe('haPrev', function() {
    let nav;
    for(let i = 0; i < expectedValues.length; i++) {
      it(`given index ${i}, should work as expected`, function() {
        nav = slideNavigation.create(slides, i);
        should.equal(nav.hasPrev(), expectedValues[i].hasPrev);
      });
    }
  });
  describe('overview', function() {
    it('should equal to /', function() {
      const nav = slideNavigation.create(slides, 0);
      should.equal(nav.overview, '/');
    });
  });
});