import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import Logged_in from '../js/logged_in';

describe('logged_in component', () => {
  it('calls componentDidMount', function() {
    const wrapper = mount(<DateApp />);
    expect(DateApp.prototype.componentDidMount.calledOnce).to.equal(true);
  });
});

//for running tests use: ./node_modules/mocha/bin/mocha --require test/testHelper.js
