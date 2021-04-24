import Meteor from 'meteor/meteor';
import assert from 'assert';

import './users-resolver.test';
import './settings-resolver.test';
import './decks-resolver.test';
import './cards-resolver.test';
import './next-card.test';
import './answer-new-card.test';
import './answer-learning-card.test';
import './answer-relearning-card.test';
import './answer-graduated-card.test';

describe('ikan-srs', function () {
  it('package.json has correct name', async function () {
    const { name } = await import('../package.json');
    assert.strictEqual(name, 'ikan-srs');
  });

  if (Meteor.isClient) {
    it('client is not server', function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it('server is not client', function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});
