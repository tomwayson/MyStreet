import Ember from 'ember';
import ENV from '../config/environment';

// TODO: move this to util function and unit test
function processConfigParams (params) {
  // TODO the below variables are taken from financial-transparency app, and not applicable here, but
    // the pattern for converting / parsing may be useful
  // parse comma seperated value string for aspect fields
  if (typeof params.aspectFields === 'string') {
    const aspectFields = params.aspectFields.split(',').map(aspectField => {
      const trimmedAspectField = aspectField.trim();
      if (trimmedAspectField !== '') {
        return trimmedAspectField;
      }
    });
    if (aspectFields.length > 0) {
      params.aspectFields = aspectFields;
    } else {
      delete params.aspectFields;
    }
  }
  // convert subField to an array if subFields is missing
  if (!params.subFields && params.subField) {
    params.subFields = [params.subField];
    delete params.subField;
  }
  return params;
}

export default Ember.Route.extend({
  intl: Ember.inject.service(),
  session: Ember.inject.service(),
  hostUrl: Ember.computed.reads('session.portalHostname'),
  appSettings: Ember.inject.service(),
  itemService: Ember.inject.service('items-service'),

  queryParams: {
    appid: {
      refreshModel: true
    }
  },

  beforeModel: function () {
    // set base language to english, will need TODO build out alternative options
    const intl = this.get('intl');
    let defaultLocale = 'en-us';
    intl.setLocale(defaultLocale);
    // let translationKey = this._calculateTranslationKey(defaultLocale);
  },

  model (params) {
    // read params from environment config
    const {
      // statisticField,
      featureServiceUrl,
      // topListSize,
      // aspectFields,
      // subFields,
      // chartPagingSize,
      testString,
      testInt
    } = ENV.APP;
    const config = {
      // statisticField,
      featureServiceUrl,
      // topListSize,
      // aspectFields,
      // subFields,
      // chartPagingSize,
      testString,
      testInt
    };

    console.log('config0', config);

    // TODO: also validate appid is a guid
    if (params.appid) {
      // get config params from an AGO item
      return this.get('itemService').getDataById(params.appid)
      .then((response) => {
        const params = processConfigParams(response.values);
        // mixin any missing params from enviornment config and return
        this.set('appSettings.config', Object.assign(config, params));
        return Object.assign(config, params);
      }, (err) => {
        // error fetching config from AGO item
        const error = err.message || err;
        return { error };
      });
    } else {
      // just use environment config
      this.set('appSettings.config', config);
      return config;
    }
  }

});
