import {Page, Platform} from 'ionic/ionic';

@Page({
  templateUrl: 'build/pages/contato/contato.html'
})
export class contato {
  constructor(platform: Platform) {
  	window.analytics.trackView('Contato');
  }
}
