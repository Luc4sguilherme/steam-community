const request = require('request');
const SteamID = require('steamid');
const xml2js = require('xml2js');

const EResult = require('../resources/EResult.js');

exports.isSteamID = function (input) {
  let keys = Object.keys(input);
  if (keys.length != 4) {
    return false;
  }

  keys = keys.filter(function (item) {
    return ['universe', 'type', 'instance', 'accountid'].indexOf(item) != -1;
  });

  return keys.length == 4;
};

exports.decodeSteamTime = function (time) {
  let date = new Date();

  if (time.includes('@')) {
    const parts = time.split('@');
    if (!parts[0].includes(',')) {
      parts[0] += ', ' + date.getFullYear();
    }

    date = new Date(parts.join('@').replace(/(am|pm)/, ' $1') + ' UTC');
  } else {
    const amount = time.replace(/(\d) (minutes|hour|hours) ago/, '$1');

    if (time.includes('minutes')) {
      date.setMinutes(date.getMinutes() - amount);
    } else if (time.match(/hour|hours/)) {
      date.setHours(date.getHours() - amount);
    }
  }

  return date;
};

/**
 * Get an Error object for a particular EResult
 * @param {int} eresult
 * @returns {null|Error}
 */
exports.eresultError = function (eresult) {
  if (eresult == EResult.OK) {
    return null;
  }

  const err = new Error(EResult[eresult] || 'Error ' + eresult);
  err.eresult = eresult;
  return err;
};

exports.decodeJwt = function (jwt) {
  const parts = jwt.split('.');
  if (parts.length != 3) {
    throw new Error('Invalid JWT');
  }

  const standardBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

  return JSON.parse(Buffer.from(standardBase64, 'base64').toString('utf8'));
};

/**
 * Resolves a Steam profile URL to get steamID64 and vanityURL
 * @param {String} url - Full steamcommunity profile URL or only the vanity part.
 * @param {Object} callback - First argument is null/Error, second is object containing vanityURL (String) and steamID (String)
 */
exports.resolveVanityURL = function (url, callback) {
  if (!url.includes('steamcommunity.com')) {
    url = 'https://steamcommunity.com/id/' + url;
  }

  request(url + '/?xml=1', function (err, response, body) {
    if (err) {
      callback(err);
      return;
    }

    new xml2js.Parser().parseString(body, (err, parsed) => {
      if (err) {
        callback(new Error("Couldn't parse XML response"));
        return;
      }

      if (parsed.response && parsed.response.error) {
        callback(new Error("Couldn't find Steam ID"));
        return;
      }

      const steamID64 = parsed.profile.steamID64[0];
      const vanityURL = parsed.profile.customURL[0];

      callback(null, { vanityURL, steamID: steamID64 });
    });
  });
};

/**
 * Converts `input` into a SteamID object, if it's a parseable string.
 * @param {SteamID|string} input
 * @return {SteamID}
 */
exports.steamID = function (input) {
  if (exports.isSteamID(input)) {
    return input;
  }

  if (typeof input != 'string') {
    throw new Error(`Input SteamID value "${input}" is not a string`);
  }

  return new SteamID(input);
};
