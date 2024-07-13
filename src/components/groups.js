const SteamCommunity = require('../index.js');
const SteamID = require('steamid');
const xml2js = require('xml2js');
const Cheerio = require('cheerio');
const Helpers = require('./helpers.js');
const EResult = SteamCommunity.EResult;

SteamCommunity.prototype.getGroupMembers = function (
  gid,
  callback,
  members,
  link,
  addresses,
  addressIdx,
) {
  members = members || [];

  if (!link) {
    if (typeof gid !== 'string') {
      link =
        'https://steamcommunity.com/gid/' +
        gid.toString() +
        '/memberslistxml/?xml=1';
    } else {
      try {
        const sid = new SteamID(gid);
        if (sid.type == SteamID.Type.CLAN && sid.isValid()) {
          link =
            'https://steamcommunity.com/gid/' +
            sid.getSteamID64() +
            '/memberslistxml/?xml=1';
        } else {
          throw new Error("Doesn't particularly matter what this message is");
        }
      } catch (e) {
        link =
          'https://steamcommunity.com/groups/' + gid + '/memberslistxml/?xml=1';
      }
    }
  }

  addressIdx = addressIdx || 0;

  const options = {};
  options.uri = link;

  if (addresses) {
    if (addressIdx >= addresses.length) {
      addressIdx = 0;
    }

    options.localAddress = addresses[addressIdx];
  }

  const self = this;
  this.httpRequest(
    options,
    function (err, response, body) {
      if (err) {
        callback(err);
        return;
      }

      xml2js.parseString(body, function (err, result) {
        if (err) {
          callback(err);
          return;
        }

        members = members.concat(
          result.memberList.members[0].steamID64.map(function (steamID) {
            return new SteamID(steamID);
          }),
        );

        if (result.memberList.nextPageLink) {
          addressIdx++;
          self.getGroupMembers(
            gid,
            callback,
            members,
            result.memberList.nextPageLink[0],
            addresses,
            addressIdx,
          );
        } else {
          callback(null, members);
        }
      });
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.getGroupMembersEx = function (
  gid,
  addresses,
  callback,
) {
  this.getGroupMembers(gid, callback, null, null, addresses, 0);
};

SteamCommunity.prototype.joinGroup = function (gid, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/gid/' + gid.getSteamID64(),
      form: {
        action: 'join',
        sessionID: this.getSessionID(),
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

SteamCommunity.prototype.leaveGroup = function (gid, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  this._myProfile(
    'home_process',
    {
      sessionID: this.getSessionID(),
      action: 'leaveGroup',
      groupId: gid.getSteamID64(),
    },
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
  );
};

SteamCommunity.prototype.getAllGroupAnnouncements = function (
  gid,
  time,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof time === 'function') {
    callback = time;
    time = new Date(0);
  }

  this.httpRequest(
    {
      uri: 'https://steamcommunity.com/gid/' + gid.getSteamID64() + '/rss/',
    },
    function (err, response, body) {
      if (err) {
        callback(err);
        return;
      }

      xml2js.parseString(body, function (err, results) {
        if (err) {
          return callback(err);
        }

        if (!results.rss.channel[0].item) {
          return callback(null, []);
        }

        const announcements = results.rss.channel[0].item
          .map(function (announcement) {
            const splitLink = announcement.link[0].split('/');
            return {
              headline: announcement.title[0],
              content: announcement.description[0],
              date: new Date(announcement.pubDate[0]),
              author:
                typeof announcement.author === 'undefined'
                  ? null
                  : announcement.author[0],
              aid: splitLink[splitLink.length - 1],
            };
          })
          .filter(function (announcement) {
            return announcement.date > time;
          });

        return callback(null, announcements);
      });
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.postGroupAnnouncement = function (
  gid,
  headline,
  content,
  hidden,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof hidden === 'function') {
    callback = hidden;
    hidden = false;
  }

  const form = {
    sessionID: this.getSessionID(),
    action: 'post',
    headline,
    body: content,
    'languages[0][headline]': headline,
    'languages[0][body]': content,
  };

  if (hidden) {
    form.is_hidden = 'is_hidden';
  }

  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/gid/' +
        gid.getSteamID64() +
        '/announcements',
      form,
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

SteamCommunity.prototype.editGroupAnnouncement = function (
  gid,
  aid,
  headline,
  content,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  const submitData = {
    uri:
      'https://steamcommunity.com/gid/' + gid.getSteamID64() + '/announcements',
    form: {
      sessionID: this.getSessionID(),
      gid: aid,
      action: 'update',
      headline,
      body: content,
      'languages[0][headline]': headline,
      'languages[0][body]': content,
      'languages[0][updated]': 1,
    },
  };

  this.httpRequestPost(
    submitData,
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.deleteGroupAnnouncement = function (
  gid,
  aid,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  const submitData = {
    uri:
      'https://steamcommunity.com/gid/' +
      gid.getSteamID64() +
      '/announcements/delete/' +
      aid +
      '?sessionID=' +
      this.getSessionID(),
  };

  this.httpRequestGet(
    submitData,
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.scheduleGroupEvent = function (
  gid,
  name,
  type,
  description,
  time,
  server,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof server === 'function') {
    callback = server;
    server = { ip: '', password: '' };
  } else if (typeof server === 'string') {
    server = { ip: server, password: '' };
  } else if (typeof server !== 'object') {
    server = { ip: '', password: '' };
  }

  const form = {
    sessionid: this.getSessionID(),
    action: 'newEvent',
    tzOffset: new Date().getTimezoneOffset() * -60,
    name,
    type:
      typeof type === 'number' || !isNaN(parseInt(type, 10))
        ? 'GameEvent'
        : type,
    appID: typeof type === 'number' || !isNaN(parseInt(type, 10)) ? type : '',
    serverIP: server.ip,
    serverPassword: server.password,
    notes: description,
    eventQuickTime: 'now',
  };

  if (time === null) {
    form.startDate = 'MM/DD/YY';
    form.startHour = '12';
    form.startMinute = '00';
    form.startAMPM = 'PM';
    form.timeChoice = 'quick';
  } else {
    form.startDate =
      (time.getMonth() + 1 < 10 ? '0' : '') +
      (time.getMonth() + 1) +
      '/' +
      (time.getDate() < 10 ? '0' : '') +
      time.getDate() +
      '/' +
      time.getFullYear().toString().substring(2);
    form.startHour =
      time.getHours() === 0
        ? '12'
        : time.getHours() > 12
          ? time.getHours() - 12
          : time.getHours();
    form.startMinute = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    form.startAMPM = time.getHours() <= 12 ? 'AM' : 'PM';
    form.timeChoice = 'specific';
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/gid/' + gid.toString() + '/eventEdit',
      form,
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

SteamCommunity.prototype.editGroupEvent = function (
  gid,
  id,
  name,
  type,
  description,
  time,
  server,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof server === 'function') {
    callback = server;
    server = { ip: '', password: '' };
  } else if (typeof server === 'string') {
    server = { ip: server, password: '' };
  } else if (typeof server !== 'object') {
    server = { ip: '', password: '' };
  }

  const form = {
    sessionid: this.getSessionID(),
    action: 'updateEvent',
    eventID: id,
    tzOffset: new Date().getTimezoneOffset() * -60,
    name,
    type:
      typeof type === 'number' || !isNaN(parseInt(type, 10))
        ? 'GameEvent'
        : type,
    appID: typeof type === 'number' || !isNaN(parseInt(type, 10)) ? type : '',
    serverIP: server.ip,
    serverPassword: server.password,
    notes: description,
    eventQuickTime: 'now',
  };

  if (time === null) {
    form.startDate = 'MM/DD/YY';
    form.startHour = '12';
    form.startMinute = '00';
    form.startAMPM = 'PM';
    form.timeChoice = 'quick';
  } else {
    form.startDate =
      (time.getMonth() + 1 < 10 ? '0' : '') +
      (time.getMonth() + 1) +
      '/' +
      (time.getDate() < 10 ? '0' : '') +
      time.getDate() +
      '/' +
      time.getFullYear().toString().substring(2);
    form.startHour =
      time.getHours() === 0
        ? '12'
        : time.getHours() > 12
          ? time.getHours() - 12
          : time.getHours();
    form.startMinute = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    form.startAMPM = time.getHours() <= 12 ? 'AM' : 'PM';
    form.timeChoice = 'specific';
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/gid/' + gid.toString() + '/eventEdit',
      form,
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

SteamCommunity.prototype.deleteGroupEvent = function (gid, id, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  const form = {
    sessionid: this.getSessionID(),
    action: 'deleteEvent',
    eventID: id,
  };

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/gid/' + gid.toString() + '/eventEdit',
      form,
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

SteamCommunity.prototype.setGroupPlayerOfTheWeek = function (
  gid,
  steamID,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof steamID === 'string') {
    steamID = new SteamID(steamID);
  }

  this.httpRequestPost(
    {
      uri: 'https://steamcommunity.com/gid/' + gid.getSteamID64() + '/potwEdit',
      form: {
        xml: 1,
        action: 'potw',
        memberId: steamID.getSteam3RenderedID(),
        sessionid: this.getSessionID(),
      },
    },
    function (err, response, body) {
      if (!callback) {
        return;
      }

      if (err || response.statusCode != 200) {
        callback(err || new Error('HTTP error ' + response.statusCode));
        return;
      }

      xml2js.parseString(body, function (err, results) {
        if (err) {
          callback(err);
          return;
        }

        if (results.response.results[0] == 'OK') {
          callback(
            null,
            new SteamID(results.response.oldPOTW[0]),
            new SteamID(results.response.newPOTW[0]),
          );
        } else {
          callback(new Error(results.response.results[0]));
        }
      });
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.kickGroupMember = function (gid, steamID, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof steamID === 'string') {
    steamID = new SteamID(steamID);
  }

  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/gid/' +
        gid.getSteamID64() +
        '/membersManage',
      form: {
        sessionID: this.getSessionID(),
        action: 'kick',
        memberId: steamID.getSteamID64(),
        queryString: '',
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

SteamCommunity.prototype.getGroupHistory = function (gid, page, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof page === 'function') {
    callback = page;
    page = 1;
  }

  this.httpRequest(
    'https://steamcommunity.com/gid/' +
      gid.getSteamID64() +
      '/history?p=' +
      page,
    function (err, response, body) {
      if (err) {
        callback(err);
        return;
      }

      const $ = Cheerio.load(body);
      const output = {};

      const paging = $('.group_paging p').text();
      const match = paging.match(/(\d+) - (\d+) of (\d+)/);

      if (match) {
        output.first = parseInt(match[1], 10);
        output.last = parseInt(match[2], 10);
        output.total = parseInt(match[3], 10);
      }

      output.items = [];
      const currentYear = new Date().getFullYear();
      const lastDate = Date.now();

      Array.prototype.forEach.call(
        $('.historyItem, .historyItemb'),
        function (item) {
          const data = {};

          const $item = $(item);
          data.type = $item.find('.historyShort').text().replace(/ /g, '');

          const users = $item.find('.whiteLink[data-miniprofile]');
          let sid;
          if (users[0]) {
            sid = new SteamID();
            sid.universe = SteamID.Universe.PUBLIC;
            sid.type = SteamID.Type.INDIVIDUAL;
            sid.instance = SteamID.Instance.DESKTOP;
            sid.accountid = $(users[0]).data('miniprofile');
            data.user = sid;
          }

          if (users[1]) {
            sid = new SteamID();
            sid.universe = SteamID.Universe.PUBLIC;
            sid.type = SteamID.Type.INDIVIDUAL;
            sid.instance = SteamID.Instance.DESKTOP;
            sid.accountid = $(users[1]).data('miniprofile');
            data.actor = sid;
          }

          const dateParts = $item.find('.historyDate').text().split('@');
          let date =
            dateParts[0]
              .trim()
              .replace(/(st|nd|th)$/, '')
              .trim() +
            ', ' +
            currentYear;
          const time = dateParts[1].trim().replace(/(am|pm)/, ' $1');

          date = new Date(date + ' ' + time + ' UTC');

          if (date.getTime() > lastDate) {
            date.setFullYear(date.getFullYear() - 1);
          }

          data.date = date;

          output.items.push(data);
        },
      );

      callback(null, output);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.getAllGroupComments = function (
  gid,
  from,
  count,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  const options = {
    uri:
      'https://steamcommunity.com/comment/Clan/render/' +
      gid.getSteamID64() +
      '/-1/',
    form: {
      start: from,
      count,
    },
  };

  this.httpRequestPost(
    options,
    function (err, response, body) {
      if (err) {
        callback(err);
        return;
      }

      const comments = [];

      const $ = Cheerio.load(JSON.parse(body).comments_html);

      $('.commentthread_comment_content').each(function () {
        const comment = {};

        let $selector = $(this).find('.commentthread_author_link');
        comment.authorName = $($selector).find('bdi').text();
        comment.authorId = $($selector)
          .attr('href')
          .replace(/https?:\/\/steamcommunity.com\/(id|profiles)\//, '');
        comment.date = Helpers.decodeSteamTime(
          $(this).find('.commentthread_comment_timestamp').text().trim(),
        );

        $selector = $(this).find('.commentthread_comment_text');
        comment.commentId = $($selector)
          .attr('id')
          .replace('comment_content_', '');
        comment.text = $($selector).html().trim();

        comments.push(comment);
      });

      callback(null, comments);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.deleteGroupComment = function (gid, cid, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  if (typeof cid !== 'string') {
    cid = cid.toString();
  }

  const options = {
    uri:
      'https://steamcommunity.com/comment/Clan/delete/' +
      gid.getSteamID64() +
      '/-1/',
    form: {
      sessionid: this.getSessionID(),
      gidcomment: cid,
    },
  };

  this.httpRequestPost(
    options,
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

SteamCommunity.prototype.postGroupComment = function (gid, message, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  const options = {
    uri:
      'https://steamcommunity.com/comment/Clan/post/' +
      gid.getSteamID64() +
      '/-1/',
    form: {
      comment: message,
      count: 6,
      sessionid: this.getSessionID(),
    },
  };

  this.httpRequestPost(
    options,
    function (err) {
      if (!callback) {
        return;
      }

      callback(err || null);
    },
    'steamcommunity',
  );
};

/**
 * Get requests to join a restricted group.
 * @param {SteamID|string} gid - The SteamID of the group you want to manage
 * @param {function} callback - First argument is null/Error, second is array of SteamID objects
 */
SteamCommunity.prototype.getGroupJoinRequests = function (gid, callback) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  this.httpRequestGet(
    'https://steamcommunity.com/gid/' +
      gid.getSteamID64() +
      '/joinRequestsManage',
    (_err, res, body) => {
      if (!body) {
        callback(new Error('Malformed response'));
        return;
      }

      const matches = body.match(
        /JoinRequests_ApproveDenyUser\(\W*['"](\d+)['"],\W0\W\)/g,
      );
      if (!matches) {
        callback(null, []);
        return;
      }

      const requests = [];
      for (let i = 0; i < matches.length; i++) {
        requests.push(
          new SteamID(
            '[U:1:' +
              matches[i].match(
                /JoinRequests_ApproveDenyUser\(\W*['"](\d+)['"],\W0\W\)/,
              )[1] +
              ']',
          ),
        );
      }

      callback(null, requests);
    },
    'steamcommunity',
  );
};

/**
 * Respond to one or more join requests to a restricted group.
 * @param {SteamID|string} gid - The SteamID of the group you want to manage
 * @param {SteamID|string|SteamID[]|string[]} steamIDs - The SteamIDs of the users you want to approve or deny membership for (or a single value)
 * @param {boolean} approve - True to put them in the group, false to deny their membership
 * @param {function} callback - Takes only an Error object/null as the first argument
 */
SteamCommunity.prototype.respondToGroupJoinRequests = function (
  gid,
  steamIDs,
  approve,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  const rgAccounts = (!Array.isArray(steamIDs) ? [steamIDs] : steamIDs).map(
    sid => sid.toString(),
  );

  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/gid/' +
        gid.getSteamID64() +
        '/joinRequestsManage',
      form: {
        rgAccounts,
        bapprove: approve ? '1' : '0',
        json: '1',
        sessionID: this.getSessionID(),
      },
      json: true,
    },
    (_err, res, body) => {
      if (!callback) {
        return;
      }

      if (body != EResult.OK) {
        const err = new Error(EResult[body] || 'Error ' + body);
        err.eresult = body;
        callback(err);
      } else {
        callback(null);
      }
    },
    'steamcommunity',
  );
};

/**
 * Respond to *ALL* pending group-join requests for a particular group.
 * @param {SteamID|string} gid - The SteamID of the group you want to manage
 * @param {boolean} approve - True to allow everyone who requested into the group, false to not
 * @param {function} callback - Takes only an Error object/null as the first argument
 */
SteamCommunity.prototype.respondToAllGroupJoinRequests = function (
  gid,
  approve,
  callback,
) {
  if (typeof gid === 'string') {
    gid = new SteamID(gid);
  }

  this.httpRequestPost(
    {
      uri:
        'https://steamcommunity.com/gid/' +
        gid.getSteamID64() +
        '/joinRequestsManage',
      form: {
        bapprove: approve ? '1' : '0',
        json: '1',
        action: 'bulkrespond',
        sessionID: this.getSessionID(),
      },
      json: true,
    },
    (_err, res, body) => {
      if (!callback) {
        return;
      }

      if (body != EResult.OK) {
        const err = new Error(EResult[body] || 'Error ' + body);
        err.eresult = body;
        callback(err);
      } else {
        callback(null);
      }
    },
    'steamcommunity',
  );
};

/**
 * Follows a curator page
 * @param {string|number} curatorId - ID of the curator (not a SteamID)
 * @param {function} callback - Takes only an Error object/null as the first argument
 */
SteamCommunity.prototype.followCurator = function (curatorId, callback) {
  this.httpRequestPost(
    {
      uri: 'https://store.steampowered.com/curators/ajaxfollow',
      form: {
        clanid: curatorId,
        sessionid: this.getSessionID(),
        follow: 1,
      },
      json: true,
    },
    (err, res, body) => {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success && body.success.success != SteamCommunity.EResult.OK) {
        callback(Helpers.eresultError(body.success.success));
        return;
      }

      callback(null);
    },
    'steamcommunity',
  );
};

/**
 * Unfollows a curator page
 * @param {string|number} curatorId - ID of the curator (not a SteamID)
 * @param {function} callback - Takes only an Error object/null as the first argument
 */
SteamCommunity.prototype.unfollowCurator = function (curatorId, callback) {
  this.httpRequestPost(
    {
      uri: 'https://store.steampowered.com/curators/ajaxfollow',
      form: {
        clanid: curatorId,
        sessionid: this.getSessionID(),
        follow: 0,
      },
      json: true,
    },
    (err, res, body) => {
      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      if (body.success && body.success.success != SteamCommunity.EResult.OK) {
        callback(Helpers.eresultError(body.success.success));
        return;
      }

      callback(null);
    },
    'steamcommunity',
  );
};
