import {IonicPlatform, IonicApp, Page, NavController, NavParams, Storage, SqlStorage, LocalStorage, Platform} from 'ionic/ionic';
import {home} from '../home/home';
import {favoritos} from '../favoritos/favoritos';
import {geladeira} from '../geladeira/geladeira';
import {contato} from '../contato/contato';

import {Http} from 'angular2/http';


@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  constructor(app: IonicApp, nav: NavController, navParams: NavParams, http: Http, platform: Platform) {

    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = home;
    this.tab2Root = favoritos;
    this.tab3Root = geladeira;
    this.tab4Root = contato;

    this.http = http;
    
    platform.ready().then(() => {
      this.storage = new Storage(SqlStorage);
      console.log(window.analytics);
      window.analytics.startTrackerWithId('UA-62380044-1');
      console.log("device.uuid", device.uuid);
      window.analytics.setUserId(device.uuid);
      window.analytics.enableUncaughtExceptionReporting(true, function(s){console.log(s)}, function(e){console.error(e)});
    
      this.storage.get('FirstExecution').then((value) => {
        console.log("value", value);
        if (value != "Firsted") {
          console.log("is first");
          this.first();
        }
      })
    });
  }

  first() {

    function HtmlEncode(s){
      s = s.replace(/"/g, "'");
      return s;
    }

    this.storage.set('UpdateTimestamp', 1444864424);
    this.storage.set('Favoritos', JSON.stringify([]));
    this.storage.set('PratosFeitos', JSON.stringify([]));

    var receita = 'CREATE TABLE IF NOT EXISTS `receita` (' +
      '`id`  INT,' +
      '`nome`  TEXT,' +
      '`imagem`  TEXT,' +
      '`receita` TEXT,' +
      '`ingredientes`  TEXT,' +
      '`quantidades` TEXT,' +
      '`tempo` TEXT,' +
      '`temperatura` TEXT,' +
      '`serve` TEXT,' +
      '`categoria` INT,' +
      '`like`  TEXT' +
      ');';

    var ingredientes = 'CREATE TABLE IF NOT EXISTS `ingredientes` (' +
      '`id`  INTEGER,' +
      '`nome`  TEXT' +
      ');';

    // criando tabela ingredientes e inserindo dados
    this.storage.query(ingredientes).then((data) => {
      console.log("TABLE CREATED -> " + JSON.stringify(data.res));

      this.http.get("ingredientes.json")
        .subscribe(data => {
          data = JSON.parse(data._body);
          console.log("ingredientes.json", data);
          for (var i = 0; i < data.length; i++) {
            var ing = ' INSERT INTO ingredientes (id , nome) VALUES (' + i + ',"' + HtmlEncode(data[i]) + '");';

            this.storage.query(ing).then((data) => {
              console.log("i DATA ADD -> " + JSON.stringify(data.res));
            }, (error) => {
              console.log("i DATA ERROR -> " + JSON.stringify(error.err));
            });

          };

        }, error => {
          console.log(JSON.stringify(error.json()));
        });

    }, (error) => {
      console.log("ERROR -> " + JSON.stringify(error.err));
    });

    // criando tabela receitas e inserindo dados
    this.storage.query(receita).then((data) => {
      console.log("TABLE CREATED -> " + JSON.stringify(data.res));

      this.http.get("pratos.json")
        .subscribe(data => {
          data = JSON.parse(data._body);
          console.log("pratos.json", data);
          for (var i = 0; i < data.length; i++) {
            var rec = 'INSERT INTO receita (id , nome,imagem, receita, ingredientes, quantidades, tempo, temperatura, serve, categoria,like) VALUES ("' + HtmlEncode(data[i].id) + '", "' + HtmlEncode(data[i].nome) + '", "' + HtmlEncode(data[i].imagem) + '", "' + HtmlEncode(data[i].receita) + '", "' + HtmlEncode(data[i].ingredientes) + '", "' + HtmlEncode(data[i].quantidades) + '", "' + HtmlEncode(data[i].tempo) + '", "' + HtmlEncode(data[i].temperatura) + '", "' + HtmlEncode(data[i].serve) + '", "' + HtmlEncode(data[i].categoria) + '","' + HtmlEncode(data[i].like) + '");';
            this.storage.query(rec).then((data) => {
              console.log("p DATA ADD -> " + JSON.stringify(data.res));
            }, (error) => {
              console.log("p DATA ERROR -> " + JSON.stringify(error.err));
            });

          };

        }, error => {
          console.log(JSON.stringify(error.json()));
        });

    }, (error) => {
      console.log("ERROR -> " + JSON.stringify(error.err));
    });

    this.storage.set('FirstExecution', "Firsted");
  }

}