import {Storage, SqlStorage, IonicPlatform, IonicApp, Page, NavController, NavParams, Platform} from 'ionic/ionic';
import {receita} from '../receita/receita';
 
@Page({
  templateUrl: 'build/pages/categoria/categoria.html',
})
export class categoria {
  constructor(app: IonicApp, nav: NavController, navParams: NavParams, platform: Platform) {
    this.platform = platform;
    this.navParams = navParams;

    this.controlador = 0;
    this.loadMore = true;

    this.receitas = [];
    this.items = [];
 
    this.nav = nav;

    this.platform.ready().then(() => {
      this.storage = new Storage(SqlStorage);
      
      this.title = navParams.get('name');
      
      window.analytics.trackView('Categoria - '+this.title);
      window.analytics.trackEvent('Categoria', this.title)

      this.internet = false;
      this.checkConnection();

      this.carregaItems();
    })
    
  }

  carregaItems(){
    this.platform.ready().then(() => {
      console.log('select * from receita WHERE categoria='+this.navParams.get('id'));
      this.storage.query('select * from receita WHERE categoria='+this.navParams.get('id')).then((data) => {
          console.log("select receita ", this.navParams.get('id'), data);
          if(data.res.rows.length > 0) { console.log("4")
            for(var i = 0; i < data.res.rows.length; i++) {
              console.log("item "+i,data.res.rows.item(i));
              data.res.rows.item(i).imagem = 'http://bastidor.com.br/airfry/img/prato/' + data.res.rows.item(i).imagem;
              this.receitas.push(data.res.rows.item(i));
            }
            this.carregaMais();
          }
        })
    })
  }

  carregaMais(){
    var c = 0;
    for (var i = this.controlador; (i < this.receitas.length && c < 5); i++) { c++;
      this.items.push(this.receitas[i]);
    };
    this.controlador += c;

    this.loadMore = this.receitas.length > this.controlador;
  }

  checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = false;
    states[Connection.ETHERNET] = true;
    states[Connection.WIFI]     = true;
    states[Connection.CELL_2G]  = true;
    states[Connection.CELL_3G]  = true;
    states[Connection.CELL_4G]  = true;
    states[Connection.CELL]     = true;
    states[Connection.NONE]     = false;

    this.internet = states[networkState];
  }

  href(event,id) {
    this.nav.push(receita, {id: id});
  }
}
