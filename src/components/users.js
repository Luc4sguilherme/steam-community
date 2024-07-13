const Cheerio = require('cheerio');
const Crypto = require('crypto');
const imageSize = require('image-size');
const SteamID = require('steamid');

const SteamCommunity = require('../index.js');

const Helpers = require('./helpers.js');

SteamCommunity.prototype.addFriend = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/actions/AddFriendAjax',
      form: {
        accept_invite: 0,
        sessionID: this.getSessionID(),
        steamid: userID.toString(),
      },
      json: true,
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success) {
        callback(null);
      } else {
        callback(new Error('Unknown error'));
      }
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.acceptFriendRequest = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/actions/AddFriendAjax',
      form: {
        accept_invite: 1,
        sessionID: this.getSessionID(),
        steamid: userID.toString(),
      },
    },
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.removeFriend = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/actions/RemoveFriendAjax',
      form: {
        sessionID: this.getSessionID(),
        steamid: userID.toString(),
      },
    },
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.removeFriends = function (friends, callback) {
  if (!Array.isArray(friends)) {
    throw new Error('The friends must be an array.');
  }

  friends = friends.map(friend => {
    if (friend instanceof SteamID) {
      return friend.getSteamID64();
    }

    return friend;
  });

  const self = this;
  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/profiles/' +
        self.steamID.getSteamID64() +
        '/friends/action',
      form: {
        sessionID: this.getSessionID(),
        steamid: self.steamID.getSteamID64(),
        action: 'remove',
        ajax: '1',
        'steamids[]': friends,
      },
      headers: {
        Origin: 'https://steamcommunity.com',
        Referer:
          'https://steamcommunity.com/profiles/' +
          self.steamID.getSteamID64() +
          '/friends/',
      },
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (body.success) {
        callback(null);
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.blockCommunication = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/actions/BlockUserAjax',
      form: {
        sessionID: this.getSessionID(),
        steamid: userID.toString(),
      },
    },
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.unblockCommunication = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  const form = { action: 'unignore' };
  form['friends[' + userID.toString() + ']'] = 1;

  this._myProfile('friends/blocked/', form, function (err, response) {
    if (!callback) {
      return;
    }

    if (err || response.statusCode >= 400) {
      callback(err || new Error('HTTP error ' + response.statusCode));
      return;
    }

    callback(null);
  });
};

SteamCommunity.prototype.postUserComment = function (
  userID,
  message,
  callback,
) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/comment/Profile/post/' +
        userID.toString() +
        '/-1',
      form: {
        comment: message,
        count: 1,
        sessionid: this.getSessionID(),
      },
      json: true,
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success) {
        const $ = Cheerio.load(body.comments_html);
        const commentID = $('.commentthread_comment').attr('id').split('_')[1];

        callback(null, commentID);
      } else if (body.error) {
        callback(new Error(body.error));
      } else {
        callback(new Error('Unknown error'));
      }
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.deleteUserComment = function (
  userID,
  commentID,
  callback,
) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/comment/Profile/delete/' +
        userID.toString() +
        '/-1',
      form: {
        gidcomment: commentID,
        start: 0,
        count: 1,
        sessionid: this.getSessionID(),
        feature2: -1,
      },
      json: true,
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success && !body.comments_html.includes(commentID)) {
        callback(null);
      } else if (body.error) {
        callback(new Error(body.error));
      } else if (body.comments_html.includes(commentID)) {
        callback(new Error('Failed to delete comment'));
      } else {
        callback(new Error('Unknown error'));
      }
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.getUserComments = function (
  userID,
  options,
  callback,
) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const form = Object.assign(
    {
      start: 0,
      count: 0,
      feature2: -1,
      sessionid: this.getSessionID(),
    },
    options,
  );

  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/comment/Profile/render/' +
        userID.toString() +
        '/-1',
      form,
      json: true,
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success) {
        const $ = Cheerio.load(body.comments_html);
        const comments = $('.commentthread_comment.responsive_body_text[id]')
          .map((i, elem) => {
            const $elem = $(elem);
            const $commentContent = $elem.find('.commentthread_comment_text');
            return {
              id: $elem.attr('id').split('_')[1],
              author: {
                steamID: new SteamID(
                  '[U:1:' +
                    $elem.find('[data-miniprofile]').data('miniprofile') +
                    ']',
                ),
                name: $elem.find('bdi').text(),
                avatar: $elem.find('.playerAvatar img[src]').attr('src'),
                state: $elem
                  .find('.playerAvatar')
                  .attr('class')
                  .split(' ')
                  .pop(),
              },
              date: new Date(
                $elem
                  .find('.commentthread_comment_timestamp')
                  .data('timestamp') * 1000,
              ),
              text: $commentContent.text().trim(),
              html: $commentContent.html().trim(),
            };
          })
          .get();

        callback(null, comments, body.total_count);
      } else if (body.error) {
        callback(new Error(body.error));
      } else {
        callback(new Error('Unknown error'));
      }
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.inviteUserToGroup = function (
  userID,
  groupID,
  callback,
) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/actions/GroupInvite',
      form: {
        group: groupID.toString(),
        invitee: userID.toString(),
        json: 1,
        sessionID: this.getSessionID(),
        type: 'groupInvite',
      },
      json: true,
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.results == 'OK') {
        callback(null);
      } else if (body.results) {
        callback(new Error(body.results));
      } else {
        callback(new Error('Unknown error'));
      }
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.followUser = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri: `https://steamcommunity.com/profiles/${userID.toString()}/followuser/`,
      form: {
        sessionid: this.getSessionID(),
      },
      json: true,
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success && body.success != SteamCommunity.EResult.OK) {
        callback(Helpers.eresultError(body.success));
        return;
      }

      callback(null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.unfollowUser = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestPost(
    {
      uri: `https://steamcommunity.com/profiles/${userID.toString()}/unfollowuser/`,
      form: {
        sessionid: this.getSessionID(),
      },
      json: true,
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success && body.success != SteamCommunity.EResult.OK) {
        callback(Helpers.eresultError(body.success));
        return;
      }

      callback(null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.getUserAliases = function (userID, callback) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequestGet(
    {
      uri:
        'https://steamcommunity.com/profiles/' +
        userID.getSteamID64() +
        '/ajaxaliases',
      json: true,
    },
    function (err, response, body) {
      if (err) {
        callback(err);
        return;
      }

      if (typeof body !== 'object') {
        callback(new Error('Malformed response'));
        return;
      }

      callback(
        null,
        body.map(function (entry) {
          entry.timechanged = Helpers.decodeSteamTime(entry.timechanged);
          return entry;
        }),
      );
    },
    'steamcommunity',
  );
};

/**
 * Get the background URL of user's profile.
 * @param {SteamID|string} userID - The user's SteamID as a SteamID object or a string which can parse into one
 * @param {function} callback
 */
SteamCommunity.prototype.getUserProfileBackground = function (
  userID,
  callback,
) {
  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequest(
    'https://steamcommunity.com/profiles/' + userID.getSteamID64(),
    (err, response, body) => {
      if (err) {
        callback(err);
        return;
      }

      const $ = Cheerio.load(body);

      const $privateProfileInfo = $('.profile_private_info');
      if ($privateProfileInfo.length > 0) {
        callback(new Error($privateProfileInfo.text().trim()));
        return;
      }

      if ($('body').hasClass('has_profile_background')) {
        const backgroundUrl = $('div.profile_background_image_content').css(
          'background-image',
        );
        const matcher = backgroundUrl.match(/\(([^)]+)\)/);

        if (matcher.length != 2 || !matcher[1].length) {
          callback(new Error('Malformed response'));
        } else {
          callback(null, matcher[1]);
        }
      } else {
        callback(null, null);
      }
    },
    'steamcommunity',
  );
};

/**
 * Upload an image to Steam and send it to another user over Steam chat.
 * @param {SteamID|string} userID - Either a SteamID object or a string that can parse into one
 * @param {Buffer} imageContentsBuffer - The image contents, as a Buffer
 * @param {{spoiler?: boolean}} [options]
 * @param {function} callback
 */
SteamCommunity.prototype.sendImageToUser = function (
  userID,
  imageContentsBuffer,
  options,
  callback,
) {
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }

  options = options || {};

  if (!userID) {
    callback(new Error("The user's SteamID is invalid or missing"));
    return;
  }

  if (typeof userID == 'string') {
    userID = new SteamID(userID);
  }

  if (!Buffer.isBuffer(imageContentsBuffer)) {
    callback(
      new Error('The image contents must be a Buffer containing an image'),
    );
    return;
  }

  let imageDetails = null;
  try {
    imageDetails = imageSize(imageContentsBuffer);
  } catch (ex) {
    callback(ex);
    return;
  }

  let imageHash = Crypto.createHash('sha1');
  imageHash.update(imageContentsBuffer);
  imageHash = imageHash.digest('hex');

  const filename = Date.now() + '_image.' + imageDetails.type;

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/chat/beginfileupload/?l=english',
      headers: {
        referer: 'https://steamcommunity.com/chat/',
      },
      formData: {
        sessionid: this.getSessionID(),
        l: 'english',
        file_size: imageContentsBuffer.length,
        file_name: filename,
        file_sha: imageHash,
        file_image_width: imageDetails.width,
        file_image_height: imageDetails.height,
        file_type:
          'image/' + (imageDetails.type == 'jpg' ? 'jpeg' : imageDetails.type),
      },
      json: true,
    },
    (err, res, body) => {
      if (err) {
        if (body && body.success) {
          const err2 = Helpers.eresultError(body.success);
          if (body.message) {
            err2.message = body.message;
          }
          callback(err2);
        } else {
          callback(err);
        }
        return;
      }

      if (body.success != 1) {
        callback(Helpers.eresultError(body.success));
        return;
      }

      const hmac = body.hmac;
      const timestamp = body.timestamp;
      const startResult = body.result;

      if (
        !startResult ||
        !startResult.ugcid ||
        !startResult.url_host ||
        !startResult.request_headers
      ) {
        callback(new Error('Malformed response'));
        return;
      }

      const uploadUrl =
        (startResult.use_https ? 'https' : 'http') +
        '://' +
        startResult.url_host +
        startResult.url_path;
      const headers = {};
      startResult.request_headers.forEach(header => {
        headers[header.name.toLowerCase()] = header.value;
      });

      this.httpRequest(
        {
          uri: uploadUrl,
          method: 'PUT',
          headers,
          body: imageContentsBuffer,
        },
        err => {
          if (err) {
            callback(err);
            return;
          }

          this.httpRequestPost(
            {
              uri: 'https://steamcommunity.com/chat/commitfileupload/',
              headers: {
                referer: 'https://steamcommunity.com/chat/',
              },
              formData: {
                sessionid: this.getSessionID(),
                l: 'english',
                file_name: filename,
                file_sha: imageHash,
                success: '1',
                ugcid: startResult.ugcid,
                file_type:
                  'image/' +
                  (imageDetails.type == 'jpg' ? 'jpeg' : imageDetails.type),
                file_image_width: imageDetails.width,
                file_image_height: imageDetails.height,
                timestamp,
                hmac,
                friend_steamid: userID.getSteamID64(),
                spoiler: options.spoiler ? '1' : '0',
              },
              json: true,
            },
            (err, res, body) => {
              if (err) {
                callback(err);
                return;
              }

              if (body.success != 1) {
                callback(Helpers.eresultError(body.success));
                return;
              }

              if (body.result.success != 1) {
                callback(Helpers.eresultError(body.result.success));
                return;
              }

              if (!body.result.details || !body.result.details.url) {
                callback(new Error('Malformed response'));
                return;
              }

              callback(null, body.result.details.url);
            },
            'steamcommunity',
          );
        },
        'steamcommunity',
      );
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.getCommentPrivacy = function (userID, callback) {
  if (typeof userID === 'undefined') {
    throw new Error('ID64 is undefined');
  }

  if (typeof userID === 'string') {
    userID = new SteamID(userID);
  }

  this.httpRequest(
    {
      uri: 'https://steamcommunity.com/profiles/' + userID.toString(),
    },
    (err, _response, body) => {
      if (err) {
        callback(err);
      }

      const $ = Cheerio.load(body);
      const profileCommentArea = $('.profile_comment_area');

      if (!profileCommentArea) {
        callback(new Error('Malformed response'));
      }

      const commentPrivacy =
        profileCommentArea.children().length > 0 ? 'Public' : 'Private';

      callback(null, commentPrivacy);
    },
    'steamcommunity',
  );
};
