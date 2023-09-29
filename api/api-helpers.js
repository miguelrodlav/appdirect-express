var utils = require('util');
var request = require('request');
var xml2js = require('xml2js');
var ApiAuth = require('../api/api-auth.js');
var parser = new xml2js.Parser({ explicitArray: false });

function getEventDescription(eventData) {
  switch (eventData.event.type) {
    case 'SUBSCRIPTION_ORDER': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.company.name,
        eventData.event.marketplace.partner
      );
    }
    case 'SUBSCRIPTION_CHANGE': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    case 'SUBSCRIPTION_CANCEL': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    case 'SUBSCRIPTION_NOTICE': {
      return utils.format(
        '%s request for %s with notice %s on %s has been processed',
        eventData.event.type,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.payload.notice.type,
        eventData.event.marketplace.partner
      );
    }
    default: {
      return 'Unknown event type';
    }
  }
}

function getAddOnEventDescription(eventData) {
  switch (eventData.event.type) {
    case 'ADDON_ORDER': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    case 'ADDON_CHANGE': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    case 'ADDON_CANCEL': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    case 'ADDON_BIND': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    case 'ADDON_UNBIND': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    default: {
      return 'Unknown event type';
    }
  }
}

function getUserEventDescription(eventData) {
  switch (eventData.event.type) {
    case 'USER_ASSIGNMENT': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    case 'USER_UNASSIGNMENT': {
      return utils.format(
        '%s request by %s for %s on %s has been processed',
        eventData.event.type,
        eventData.event.creator.email,
        eventData.event.payload.account.accountIdentifier,
        eventData.event.marketplace.partner
      );
    }
    default: {
      return 'Unknown event type';
    }
  }
}

function obtainAccessToken(clientId, clientSecret, tokenUrl, callback) {
  request(
    {
      url: tokenUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        user: clientId,
        pass: clientSecret,
      },
      form: {
        grant_type: 'client_credentials',
      },
    },
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        const token = JSON.parse(body).access_token;
        callback(null, token);
      } else {
        callback(err);
      }
    }
  );
}

function getEventData(req, res, next) {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const tokenUrl = process.env.TOKEN_URL;

  obtainAccessToken(clientId, clientSecret, tokenUrl, function (err, token) {
    if (err) return next(err);

    var data = {
      url: req.query.eventUrl,
      method: 'GET',
    };

    request(
      {
        url: data.url,
        method: data.method,
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
      function (err, response, body) {
        if (!err && response.statusCode == 200) {
          parser.parseString(body, function (err, result) {
            req.eventData = result;
            next();
          });
        } else {
          next(err);
        }
      }
    );
  });
}

function checkForEventUrl(req, res, next) {
  if (!req.query.eventUrl) {
    return res.sendApiError(
      'INVALID_RESPONSE',
      'The parameter eventUrl is a required'
    );
  }
  next();
}

var apiAuth;
module.exports = function (config) {
  apiAuth = ApiAuth(config);
  return {
    getEventDescription: getEventDescription,
    getEventData: getEventData,
    checkForEventUrl: checkForEventUrl,
    getAddOnEventDescription: getAddOnEventDescription,
    getUserEventDescription: getUserEventDescription,
  };
};
