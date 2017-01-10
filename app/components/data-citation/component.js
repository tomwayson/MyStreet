import Ember from 'ember';

export default Ember.Component.extend({
  ajax: Ember.inject.service(),
  citationFound: false,

  init () {
    this._super.apply(this, arguments);
  },

  didReceiveAttrs() {
    // TODO pass in baseUrl for the API
    let urlRegex = this.get('layer.url').replace(/.*?\/\//g,"http://");
    let urlFilter = `https://opendata.arcgis.com/api/v2/datasets?include=sites&filter[url]=${urlRegex}`;
    this.get('ajax').request(urlFilter, {dataType: 'json'})
      .then((response) =>{
        this.set('dataName', response.data[0].attributes.name);

        let baseUrl = response.included[0].attributes.url;
        let id = response.data[0].id;

        let odLink = `${baseUrl}/datasets/${id}`;
        let agolLink = response.data[0].attributes.landingPage;
        let serverLink = this.get('layer.url');
        let dataLink;

        this.set('citationFound', true);
        if (odLink) {
          dataLink = odLink;
        } else if (agolLink) {
          dataLink = agolLink;
        } else if (serverLink) {
          dataLink = serverLink;
        } else {
          this.set('citationFound', false);
        }
        this.set('dataLink', dataLink)
      });
  }
});