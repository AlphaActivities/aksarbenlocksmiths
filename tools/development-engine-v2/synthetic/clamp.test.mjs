import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp} from './clamp.mjs';
test('clamps below and above bounds',()=>{assert.equal(clamp(-1,0,10),0);assert.equal(clamp(11,0,10),10)});
test('preserves interior and inclusive boundaries',()=>{for(const n of [0,5,10])assert.equal(clamp(n,0,10),n)});
test('handles equal bounds',()=>assert.equal(clamp(99,3,3),3));
