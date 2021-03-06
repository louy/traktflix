import browser from 'sinon-chrome';
import sinon from 'sinon';
import Settings from '../../src/settings';
import Scrobble from '../../src/class/content/Scrobble';
import NetflixTestUtils from '../../test-helpers/NetflixTestHelper';

window.browser = browser;

const scrobbleMovie = new Scrobble({
  type: `movie`,
  response: {
    movie: {title: `FooBar`}
  }
});
const scrobbleShow = new Scrobble({
  type: `show`,
  response: {
    title: `Bar`,
    show: {
      title: `Foo`
    }
  }
});

let server = null;

browser.flush();
delete window.browser;

describe(`Scrobble`, () => {
  before(() => {
    window.browser = browser;
  });

  beforeEach(() => {
    document.body.innerHTML = ``;
    server = sinon.fakeServer.create();
    server.autoRespond = true;
  });

  afterEach(() => {
    browser.flush();
    server.restore();
  });

  after(() => {
    browser.flush();
    delete window.browser;
  });

  it(`constructor() sets properties for movie`, () => {
    expect(scrobbleMovie.item).to.deep.equal({
      movie: {
        title: `FooBar`,
        type: `movie`
      }
    });
    expect(scrobbleMovie.success).to.be.undefined;
    expect(scrobbleMovie.error).to.be.undefined;
    expect(scrobbleMovie.url).to.equal(`${Settings.apiUri}/scrobble`);
  });

  it(`constructor() sets properties for show`, () => {
    expect(scrobbleShow.item).to.deep.equal({
      episode: {
        title: `Bar`,
        show: {
          title: `Foo`
        }
      }
    });
    expect(scrobbleShow.success).to.be.undefined;
    expect(scrobbleShow.error).to.be.undefined;
    expect(scrobbleShow.url).to.equal(`${Settings.apiUri}/scrobble`);
  });

  it(`webScrubber() sets the progress for movie`, () => {
    NetflixTestUtils.renderPlayer(`movie`);
    scrobbleMovie.webScrubber();
    expect(scrobbleMovie.progress.toFixed(2)).to.equal(`2.91`);
  });

  it(`webScrubber() sets the progress for show`, () => {
    NetflixTestUtils.renderPlayer(`show`);
    scrobbleShow.webScrubber();
    expect(scrobbleShow.progress.toFixed(2)).to.equal(`1.57`);
  });

  it(`start() calls success`, done => {
    browser.storage.local.get.withArgs(`data`).resolves({data: {access_token: `12345abcde`}});
    browser.storage.local.get.withArgs(`options`).resolves({options: {showNotifications: true}});
    browser.i18n.getMessage.withArgs(`scrobbleStarted`).returns(`scrobbleStarted`);
    server.respondWith(`POST`, `${Settings.apiUri}/scrobble/start`, [200, {[`Content-Type`]: `application/json`}, ``]);
    scrobbleShow.success = () => {
      expect(browser.runtime.sendMessage.callCount).to.equal(1);
      expect(browser.runtime.sendMessage.args[0]).to.deep.equal([{
        type: `showNotification`,
        message: `scrobbleStarted`,
        title: `traktflix: Foo - Bar`
      }]);
      done();
    };
    scrobbleShow.error = () => {
      done.fail();
    };
    scrobbleShow.start();
  });

  it(`start() calls error`, done => {
    browser.storage.local.get.withArgs(`data`).resolves({data: {access_token: `12345abcde`}});
    browser.storage.local.get.withArgs(`options`).resolves({options: {showNotifications: true}});
    browser.i18n.getMessage.withArgs(`couldNotScrobble`).returns(`couldNotScrobble`);
    server.respondWith(`POST`, `${Settings.apiUri}/scrobble/start`, [500, {[`Content-Type`]: `application/json`}, ``]);
    scrobbleShow.success = () => {
      done.fail();
    };
    scrobbleShow.error = () => {
      expect(browser.runtime.sendMessage.callCount).to.equal(1);
      expect(browser.runtime.sendMessage.args[0]).to.deep.equal([{
        type: `showErrorNotification`,
        message: `couldNotScrobble Foo - Bar`
      }]);
      done();
    };
    scrobbleShow.start();
  });

  it(`pause() calls success`, done => {
    browser.storage.local.get.withArgs(`data`).resolves({data: {access_token: `12345abcde`}});
    browser.storage.local.get.withArgs(`options`).resolves({options: {showNotifications: true}});
    browser.i18n.getMessage.withArgs(`scrobblePaused`).returns(`scrobblePaused`);
    server.respondWith(`POST`, `${Settings.apiUri}/scrobble/pause`, [200, {[`Content-Type`]: `application/json`}, ``]);
    scrobbleShow.success = () => {
      expect(browser.runtime.sendMessage.callCount).to.equal(1);
      expect(browser.runtime.sendMessage.args[0]).to.deep.equal([{
        type: `showNotification`,
        message: `scrobblePaused`,
        title: `traktflix: Foo - Bar`
      }]);
      done();
    };
    scrobbleShow.error = () => {
      done.fail();
    };
    scrobbleShow.pause();
  });

  it(`pause() calls error`, done => {
    browser.storage.local.get.withArgs(`data`).resolves({data: {access_token: `12345abcde`}});
    browser.storage.local.get.withArgs(`options`).resolves({options: {showNotifications: true}});
    browser.i18n.getMessage.withArgs(`couldNotScrobble`).returns(`couldNotScrobble`);
    server.respondWith(`POST`, `${Settings.apiUri}/scrobble/pause`, [500, {[`Content-Type`]: `application/json`}, ``]);
    scrobbleShow.success = () => {
      done.fail();
    };
    scrobbleShow.error = () => {
      expect(browser.runtime.sendMessage.callCount).to.equal(1);
      expect(browser.runtime.sendMessage.args[0]).to.deep.equal([{
        type: `showErrorNotification`,
        message: `couldNotScrobble Foo - Bar`
      }]);
      done();
    };
    scrobbleShow.pause();
  });

  it(`stop() calls success`, done => {
    browser.storage.local.get.withArgs(`data`).resolves({data: {access_token: `12345abcde`}});
    browser.storage.local.get.withArgs(`options`).resolves({options: {showNotifications: true}});
    browser.i18n.getMessage.withArgs(`scrobbleStopped`).returns(`scrobbleStopped`);
    server.respondWith(`POST`, `${Settings.apiUri}/scrobble/stop`, [200, {[`Content-Type`]: `application/json`}, ``]);
    scrobbleShow.success = () => {
      expect(browser.runtime.sendMessage.callCount).to.equal(1);
      expect(browser.runtime.sendMessage.args[0]).to.deep.equal([{
        type: `showNotification`,
        message: `scrobbleStopped`,
        title: `traktflix: Foo - Bar`
      }]);
      done();
    };
    scrobbleShow.error = () => {
      done.fail();
    };
    scrobbleShow.stop();
  });

  it(`stop() calls error`, done => {
    browser.storage.local.get.withArgs(`data`).resolves({data: {access_token: `12345abcde`}});
    browser.storage.local.get.withArgs(`options`).resolves({options: {showNotifications: true}});
    browser.i18n.getMessage.withArgs(`couldNotScrobble`).returns(`couldNotScrobble`);
    server.respondWith(`POST`, `${Settings.apiUri}/scrobble/stop`, [500, {[`Content-Type`]: `application/json`}, ``]);
    scrobbleShow.success = () => {
      done.fail();
    };
    scrobbleShow.error = () => {
      expect(browser.runtime.sendMessage.callCount).to.equal(1);
      expect(browser.runtime.sendMessage.args[0]).to.deep.equal([{
        type: `showErrorNotification`,
        message: `couldNotScrobble Foo - Bar`
      }]);
      done();
    };
    scrobbleShow.stop();
  });
});
