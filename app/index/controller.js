import Ember from 'ember';

export default Ember.Controller.extend({
  appSettings: Ember.inject.service(),
  myStreet: Ember.inject.service(),
  ajax: Ember.inject.service(),

  queryParams: ['loc', 'themeId'],
  loc: "",
  themeId: "",
  changeLoc: Ember.observer('loc', 'appSettings.settings', function () {
    var loc = this.get('loc');
    if (loc) {
      this.set('address', loc);
      this._searchAddress();
    }
  }),

  address: "",
  returnedAddress: "",
  geocodedLocation: [],

  layers: Ember.computed('appSettings.settings.webmap.operationalLayers', function() {
    return this.get('appSettings.settings.webmap.operationalLayers')
  }),
  webmap: Ember.computed('appSettings.settings.webmap', function() {
    return this.get('appSettings.settings.webmap')
  }),
  bbox: Ember.computed('appSettings.settings.webmap', function() {
    return this.get('appSettings.settings.item.extent')
  }),

  configCssUrl: Ember.computed('session.portalHostname', 'appSettings.settings.data.values.themeId', function() {
    return `https://${this.get('session.portalHostname')}/sharing/rest/content/items/${this.get('appSettings.settings.data.values.themeId')}/resources/opendata.css.txt`
  }),
  configJsonUrl: Ember.computed('session.portalHostname', 'appSettings.settings.data.values.themeId', function() {
    return `https://${this.get('session.portalHostname')}/sharing/rest/content/items/${this.get('appSettings.settings.data.values.themeId')}/resources/theme.json`
  }),
  paramCssUrl: Ember.computed('themeId', function () {
    if (this.get('themeId')) {
      return `https://${this.get('session.portalHostname')}/sharing/rest/content/items/${this.get('themeId')}/resources/opendata.css.txt`
    }
  }),
  paramJsonUrl: Ember.computed('themeId', function () {
    if (this.get('themeId')) {
      return `https://${this.get('session.portalHostname')}/sharing/rest/content/items/${this.get('themeId')}/resources/theme.json`
    }
  }),

  init () {
    this._super.apply(this, arguments);
    this.get('changeLoc');
  },

  _searchAddress (address) {
    let text = address;
    let bbox = this.get('bbox');
    let bb = {
      "xmin": bbox[0][0],
      "ymin": bbox[0][1],
      "xmax": bbox[1][0],
      "ymax": bbox[1][1],
    };
    let extent = `${bb.xmin},${bb.ymin},${bb.xmax},${bb.ymax}`;
    return this.get('ajax').request(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${text}&searchExtent=${extent}&f=json`)
  },

  _setAddress (address) {
    this.set('loc', address);
    return this.get('myStreet').findLocationAddress(address, {'bbox': this.get('bbox')})
      .then((results) => {
        this.setProperties({
          returnedAddress: results.candidates[0].address,
          geocodedLocation: [results.candidates[0].location.x, results.candidates[0].location.y]
        });
        return results;
      })
      .catch((err) => {
        this.set('returnedAddress','');
        Ember.debug('Error occured fetching the searched address: ' + JSON.stringify(err));
      });
  },

  afterModel () {
    this.set('loc', this.get('address'));
  },

  actions: {
    searchAddress (val) {
      return this._searchAddress(val);
    },
    onAddressChanged (val) {
      this._setAddress(val);
    },
  }

});
