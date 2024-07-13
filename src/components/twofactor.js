const SteamTotp = require('steam-totp');
const SteamCommunity = require('../index.js');

const ETwoFactorTokenType = {
  None: 0,
  ValveMobileApp: 1,
  ThirdParty: 2,
};

SteamCommunity.prototype.enableTwoFactor = function (callback) {
  this._verifyMobileAccessToken();

  if (!this.mobileAccessToken) {
    callback(
      new Error(
        'No mobile access token available. Provide one by calling setMobileAppAccessToken()',
      ),
    );
    return;
  }

  this.httpRequestPost(
    {
      uri:
        'https://api.steampowered.com/ITwoFactorService/AddAuthenticator/v1/?access_token=' +
        this.mobileAccessToken,

      form: {
        steamid: this.steamID.getSteamID64(),
        authenticator_type: ETwoFactorTokenType.ValveMobileApp,
        device_identifier: SteamTotp.getDeviceID(this.steamID),
        sms_phone_id: '1',
        version: 2,
      },
      json: true,
    },
    (err, response, body) => {
      if (err) {
        callback(err);
        return;
      }

      if (!body.response) {
        callback(new Error('Malformed response'));
        return;
      }

      if (body.response.status != 1) {
        const error = new Error('Error ' + body.response.status);
        error.eresult = body.response.status;
        callback(error);
        return;
      }

      callback(null, body.response);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.finalizeTwoFactor = function (
  secret,
  activationCode,
  callback,
) {
  this._verifyMobileAccessToken();

  if (!this.mobileAccessToken) {
    callback(
      new Error(
        'No mobile access token available. Provide one by calling setMobileAppAccessToken()',
      ),
    );
    return;
  }

  let diff = 0;

  const finalize = () => {
    const code = SteamTotp.generateAuthCode(secret, diff);

    this.httpRequestPost(
      {
        uri:
          'https://api.steampowered.com/ITwoFactorService/FinalizeAddAuthenticator/v1/?access_token=' +
          this.mobileAccessToken,
        form: {
          steamid: this.steamID.getSteamID64(),
          authenticator_code: code,
          authenticator_time: Math.floor(Date.now() / 1000),
          activation_code: activationCode,
        },
        json: true,
      },
      function (err, response, body) {
        if (err) {
          callback(err);
          return;
        }

        if (!body.response) {
          callback(new Error('Malformed response'));
          return;
        }

        body = body.response;

        if (body.server_time) {
          diff = body.server_time - Math.floor(Date.now() / 1000);
        }

        if (body.status == 89) {
          callback(new Error('Invalid activation code'));
        } else if (body.want_more) {
          diff += 30;

          finalize();
        } else if (!body.success) {
          callback(new Error('Error ' + body.status));
        } else {
          callback(null);
        }
      },
      'steamcommunity',
    );
  };

  SteamTotp.getTimeOffset(function (err, offset) {
    if (err) {
      callback(err);
      return;
    }

    diff = offset;
    finalize();
  });
};

SteamCommunity.prototype.disableTwoFactor = function (
  revocationCode,
  callback,
) {
  this._verifyMobileAccessToken();

  if (!this.mobileAccessToken) {
    callback(
      new Error(
        'No mobile access token available. Provide one by calling setMobileAppAccessToken()',
      ),
    );
    return;
  }

  this.httpRequestPost(
    {
      uri:
        'https://api.steampowered.com/ITwoFactorService/RemoveAuthenticator/v1/?access_token=' +
        this.mobileAccessToken,
      form: {
        steamid: this.steamID.getSteamID64(),
        revocation_code: revocationCode,
        steamguard_scheme: 1,
      },
      json: true,
    },
    function (err, response, body) {
      if (err) {
        callback(err);
        return;
      }

      if (!body.response) {
        callback(new Error('Malformed response'));
        return;
      }

      if (!body.response.success) {
        callback(new Error('Request failed'));
        return;
      }

      callback(null);
    },
    'steamcommunity',
  );
};
