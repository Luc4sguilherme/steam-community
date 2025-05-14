const { chrome } = require('@doctormckay/user-agents');
const Request = require('request');
const SteamID = require('steamid');

const Helpers = require('./components/helpers.js');

require('util').inherits(SteamCommunity, require('events').EventEmitter);

module.exports = SteamCommunity;

SteamCommunity.SteamID = SteamID;
SteamCommunity.ConfirmationType = require('./resources/EConfirmationType.js');
SteamCommunity.EResult = require('./resources/EResult.js');
SteamCommunity.EFriendRelationship = require('./resources/EFriendRelationship.js');
SteamCommunity.PersonaState = require('./resources/EPersonaState.js');
SteamCommunity.PersonaStateFlag = require('./resources/EPersonaStateFlag.js');
SteamCommunity.ECurrencyCode = require('./resources/ECurrencyCode.js');

function SteamCommunity(options) {
  options = options || {};

  this._jar = Request.jar();
  this._captchaGid = -1;
  this._httpRequestID = 0;

  const defaults = {
    jar: this._jar,
    timeout: options.timeout || 60000,
    gzip: true,
    headers: {
      'User-Agent': options.userAgent || chrome(),
    },
  };

  if (typeof options == 'string') {
    options = {
      localAddress: options,
    };
  }
  this._options = options;

  if (options.localAddress) {
    defaults.localAddress = options.localAddress;
  }

  if (options.proxy) {
    defaults.proxy = options.proxy;
  }

  this.request = options.request || Request.defaults({ forever: true });
  this.request = this.request.defaults(defaults);

  this._setCookie(Request.cookie('Steam_Language=english'));

  this._setCookie(Request.cookie('timezoneOffset=0,0'));
}

/**
 * Get a token that can be used to log onto Steam using steam-user.
 * @param {function} callback
 */
SteamCommunity.prototype.getClientLogonToken = function (callback) {
  this.httpRequestGet(
    {
      uri: 'https://steamcommunity.com/chat/clientjstoken',
      json: true,
    },
    (err, res, body) => {
      if (err || res.statusCode != 200) {
        callback(err || new Error('HTTP error ' + res.statusCode));
        return;
      }

      if (!body.logged_in) {
        const e = new Error('Not Logged In');
        callback(e);
        this._notifySessionExpired(e);
        return;
      }

      if (!body.steamid || !body.account_name || !body.token) {
        callback(new Error('Malformed response'));
        return;
      }

      callback(null, {
        steamID: new SteamID(body.steamid),
        accountName: body.account_name,
        webLogonToken: body.token,
      });
    },
  );
};

SteamCommunity.prototype._setCookie = function (cookie, secure) {
  const protocol = secure ? 'https' : 'http';
  cookie.secure = !!secure;

  if (cookie.domain) {
    this._jar.setCookie(cookie.clone(), protocol + '://' + cookie.domain);
  } else {
    this._jar.setCookie(cookie.clone(), protocol + '://steamcommunity.com');
    this._jar.setCookie(cookie.clone(), protocol + '://store.steampowered.com');
    this._jar.setCookie(cookie.clone(), protocol + '://help.steampowered.com');
  }
};

SteamCommunity.prototype.setCookies = function (cookies) {
  cookies.forEach(cookie => {
    const cookieName = cookie.trim().split('=')[0];
    if (cookieName == 'steamLogin' || cookieName == 'steamLoginSecure') {
      this.steamID = new SteamID(cookie.match(/steamLogin(Secure)?=(\d+)/)[2]);
    }

    this._setCookie(
      Request.cookie(cookie),
      !!(cookieName.match(/^steamMachineAuth/) || cookieName.match(/Secure$/)),
    );
  });

  this._verifyMobileAccessToken();
};

SteamCommunity.prototype.getSessionID = function (
  host = 'http://steamcommunity.com',
) {
  const cookies = this._jar.getCookieString(host).split(';');
  for (let i = 0; i < cookies.length; i++) {
    const match = cookies[i].trim().match(/([^=]+)=(.+)/);
    if (match[1] == 'sessionid') {
      return decodeURIComponent(match[2]);
    }
  }

  const sessionID = generateSessionID();
  this._setCookie(Request.cookie('sessionid=' + sessionID));
  return sessionID;
};

function generateSessionID() {
  return require('crypto').randomBytes(12).toString('hex');
}

SteamCommunity.prototype.parentalUnlock = function (pin, callback) {
  const self = this;
  const sessionID = self.getSessionID();

  this.httpRequestPost(
    'https://steamcommunity.com/parental/ajaxunlock',
    {
      json: true,
      form: {
        pin,
        sessionid: sessionID,
      },
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (!body || typeof body.success !== 'boolean') {
        callback(new Error('Invalid response'));
        return;
      }

      if (!body.success) {
        switch (body.eresult) {
          case 15:
            callback(new Error('Incorrect PIN'));
            break;

          case 25:
            callback(new Error('Too many invalid PIN attempts'));
            break;

          default:
            callback('Error ' + body.eresult);
        }

        return;
      }

      callback();
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.getNotifications = function (callback) {
  this.httpRequestGet(
    {
      uri: 'https://steamcommunity.com/actions/GetNotificationCounts',
      json: true,
    },
    function (err, response, body) {
      if (err) {
        callback(err);
        return;
      }

      if (!body || !body.notifications) {
        callback(new Error('Malformed response'));
        return;
      }

      const notifications = {
        trades: body.notifications[1] || 0,
        gameTurns: body.notifications[2] || 0,
        moderatorMessages: body.notifications[3] || 0,
        comments: body.notifications[4] || 0,
        items: body.notifications[5] || 0,
        invites: body.notifications[6] || 0,
        gifts: body.notifications[8] || 0,
        chat: body.notifications[9] || 0,
        helpRequestReplies: body.notifications[10] || 0,
        accountAlerts: body.notifications[11] || 0,
      };

      callback(null, notifications);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.resetItemNotifications = function (callback) {
  this.httpRequestGet(
    'https://steamcommunity.com/my/inventory',
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.loggedIn = function (callback) {
  this.httpRequestGet(
    {
      uri: 'https://steamcommunity.com/my',
      followRedirect: false,
      checkHttpError: false,
    },
    function (err, response) {
      if (err || (response.statusCode != 302 && response.statusCode != 403)) {
        callback(err || new Error('HTTP error ' + response.statusCode));
        return;
      }

      if (response.statusCode == 403) {
        callback(null, true, true);
        return;
      }

      callback(
        null,
        !!response.headers.location.match(
          /steamcommunity\.com(\/(id|profiles)\/[^/]+)\/?/,
        ),
        false,
      );
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.getTradeURL = function (callback) {
  this._myProfile(
    'tradeoffers/privacy',
    null,
    (err, response, body) => {
      if (err) {
        callback(err);
        return;
      }

      const match = body.match(
        /https?:\/\/(www.)?steamcommunity.com\/tradeoffer\/new\/?\?partner=\d+(&|&amp;)token=([a-zA-Z0-9-_]+)/,
      );
      if (match) {
        const token = match[3];
        callback(null, match[0], token);
      } else {
        callback(new Error('Malformed response'));
      }
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.changeTradeURL = function (callback) {
  this._myProfile(
    'tradeoffers/newtradeurl',
    { sessionid: this.getSessionID() },
    (_err, response, body) => {
      if (!callback) {
        return;
      }

      if (
        !body ||
        typeof body !== 'string' ||
        body.length < 3 ||
        body.indexOf('"') !== 0
      ) {
        callback(new Error('Malformed response'));
        return;
      }

      const newToken = body.replace(/"/g, '');
      callback(
        null,
        'https://steamcommunity.com/tradeoffer/new/?partner=' +
          this.steamID.accountid +
          '&token=' +
          newToken,
        newToken,
      );
    },
    'steamcommunity',
  );
};

/**
 * Clear your profile name (alias) history.
 * @param {function} callback
 */
SteamCommunity.prototype.clearPersonaNameHistory = function (callback) {
  this._myProfile(
    'ajaxclearaliashistory/',
    { sessionid: this.getSessionID() },
    (err, res, body) => {
      if (!callback) {
        return;
      }

      if (err) {
        return callback(err);
      }

      if (res.statusCode != 200) {
        return callback(new Error('HTTP error ' + res.statusCode));
      }

      try {
        body = JSON.parse(body);
        callback(Helpers.eresultError(body.success));
      } catch (ex) {
        return callback(new Error('Malformed response'));
      }
    },
  );
};

SteamCommunity.prototype._myProfile = function (endpoint, form, callback) {
  const self = this;

  if (this._profileURL) {
    completeRequest(this._profileURL);
  } else {
    this.httpRequest(
      'https://steamcommunity.com/my',
      { followRedirect: false },
      function (err, response) {
        if (err || response.statusCode != 302) {
          callback(err || 'HTTP error ' + response.statusCode);
          return;
        }

        const match = response.headers.location.match(
          /steamcommunity\.com(\/(id|profiles)\/[^/]+)\/?/,
        );
        if (!match) {
          callback(new Error("Can't get profile URL"));
          return;
        }

        self._profileURL = match[1];
        setTimeout(function () {
          delete self._profileURL;
        }, 60000).unref();

        completeRequest(match[1]);
      },
      'steamcommunity',
    );
  }

  function completeRequest(url) {
    const options = endpoint.endpoint ? endpoint : {};
    options.uri =
      'https://steamcommunity.com' +
      url +
      '/' +
      (endpoint.endpoint || endpoint);

    if (form) {
      options.method = 'POST';
      options.form = form;
      options.followAllRedirects = true;
    } else if (!options.method) {
      options.method = 'GET';
    }

    self.httpRequest(options, callback, 'steamcommunity');
  }
};

/**
 * Returns an object whose keys are 64-bit SteamIDs, and whose values are values from the EFriendRelationship enum.
 * Therefore, you can deduce your friends or blocked list from this object.
 * @param {function} callback
 */
SteamCommunity.prototype.getFriendsList = function (callback) {
  this.httpRequestGet(
    {
      uri: 'https://steamcommunity.com/textfilter/ajaxgetfriendslist',
      json: true,
    },
    (err, res, body) => {
      if (err) {
        callback(err || new Error('HTTP error ' + res.statusCode));
        return;
      }

      if (body.success != 1) {
        callback(Helpers.eresultError(body.success));
        return;
      }

      if (!body.friendslist || !body.friendslist.friends) {
        callback(new Error('Malformed response'));
        return;
      }

      const friends = {};
      body.friendslist.friends.forEach(
        friend => (friends[friend.ulfriendid] = friend.efriendrelationship),
      );
      callback(null, friends);
    },
  );
};

SteamCommunity.prototype.getFriendsLimit = function (callback) {
  this.httpRequest(
    {
      uri:
        'https://steamcommunity.com/profiles/' +
        this.steamID.toString() +
        '/friends/',
    },
    (err, _response, body) => {
      if (err) {
        callback(err);
      }

      const match = body.match(/var g_cFriendsLimit = (\d+);/);

      if (!match) {
        callback(new Error('friends limit not found'));
      }

      const limit = Number(match[1]);

      if (isNaN(limit) || limit < 250) {
        callback(
          new Error(
            "An error occurred while getting the account's friends limit",
          ),
        );
      }

      callback(null, limit);
    },
    'steamcommunity',
  );
};

require('./components/http.js');
require('./components/profile.js');
require('./components/market.js');
require('./components/groups.js');
require('./components/users.js');
require('./components/webapi.js');
require('./components/twofactor.js');
require('./components/confirmations.js');
require('./components/help.js');
require('./classes/CMarketItem.js');
require('./classes/CMarketSearchResult.js');
require('./classes/CSteamGroup.js');
require('./classes/CSteamUser.js');

/**
 @callback SteamCommunity~genericErrorCallback
 @param {Error|null} err - An Error object on failure, or null on success
 */
