import {Storage, SqlStorage, IonicPlatform, IonicApp, Page, NavController, NavParams, Platform} from 'ionic/ionic';

@Page({
  templateUrl: 'build/pages/receita/receita.html',
})
export class receita {
  constructor(app: IonicApp, nav: NavController, navParams: NavParams, platform: Platform) {

    this.storage = new Storage(SqlStorage);
   	this.id = navParams.get('id');
   	this.receita = {};

    this.favoritado = false;
    this.feito = true;
    
    platform.ready().then(() => {
      this.favorito();
      this.pFeito();

      this.internet = false;
      this.checkConnection();



     	this.storage.query('select * from receita WHERE id='+navParams.get('id')).then((data) => {
        console.log("select receita ", navParams.get('id'), data);
        if(data.res.rows.length > 0) {
          console.log("item ", data.res.rows.item(0));
          this.receita = data.res.rows.item(0);
          window.analytics.trackView( this.receita.nome );
          this.receita.imagem = "http://bastidor.com.br/airfry/img/prato/" + this.receita.imagem;
        }
      })
    })
  }

  facebook(){
    window.analytics.trackEvent('Receita', 'Compartilhou', 'Facebook');
  	var html = this.receita.quantidades +"<br><br>"+ this.receita.receita + "<br><br>" + "http://chefairfryer.com.br";
  	var div = document.createElement("div");
  	div.innerHTML = html;
	
  	window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint(
  		this.receita.nome +"\r\n\r\n"+ div.innerText, this.receita.imagem /* img */, "http://chefairfryer.com.br" /* url */, 'Você pode colar a receita dentro do conteudo da postagem.', 
  		function() {console.log('share ok')}, 
  		function(errormsg){alert(errormsg)}
  	)
  }

  email(){
    window.analytics.trackEvent('Receita', 'Compartilhou', 'Email');
  	window.plugins.socialsharing.shareViaEmail(
  		'<img src="'+this.receita.imagem + '">' + this.receita.quantidades +"\r\n\r\n"+ this.receita.receita, this.receita.nome /* titulo */, null /* to */, null/* Cc */, 
  		function() {console.log('share ok')}, 
  		function(errormsg){alert(errormsg)}
  	)
  }

  whatsapp(){
    window.analytics.trackEvent('Receita', 'Compartilhou', 'Whatsapp');
    window.plugins.socialsharing.shareViaWhatsApp(
      this.receita.nome , this.receita.imagem /* img */, "http://chefairfryer.com.br" /* url */, 'Você pode colar a receita dentro do conteudo da postagem.', 
      function() {console.log('share ok')}, 
      function(errormsg){alert(errormsg)}
    )
  }

  euFiz(){
    window.analytics.trackEvent('Receita', 'Fez', this.receita.nome);
    var url = "http://bastidor.com.br/airfry/ajax/prato";
    if(!this.feito){
      this.http.get(url + "/" + this.id + "/id/heart")
        .subscribe(data => {
          data = JSON.parse(data._body);
          this.storage.get('PratosFeitos').then((feitos) => {
            console.log("PratosFeitos", feitos);
            
            var f = JSON.parse(feitos);

            if(!(f instanceof Array))
              f = [];

            f.push(this.id);

            console.log("f",f);
            var novaArr = f.filter(function(este, i) {
                return f.indexOf(este) == i;
            })
            
            console.log("novaArr",novaArr);
            this.storage.set('PratosFeitos', JSON.stringify(novaArr)); 

            this.favorito();

          })
          this.feito = true;
        }, error => {
          console.log(JSON.stringify(error.json()));
        });
    }
  }

  favoritar(){
      this.storage.get('Favoritos').then((favoritos) => {
        console.log("Favoritos", favoritos);
        
        var fav = JSON.parse(favoritos);

        if(!(fav instanceof Array))
          fav = [];

        if(!this.favoritado){
          window.analytics.trackEvent('Receita', 'Favoritou', this.receita.nome, 1);
          fav.push(this.id);
        } else {
          window.analytics.trackEvent('Receita', 'Favoritou', this.receita.nome, -1);
          fav.splice(fav.indexOf(this.id), 1);
        }

        console.log("fav",fav);
        var novaArr = fav.filter(function(este, i) {
            return fav.indexOf(este) == i;
        })
        
        console.log("novaArr",novaArr);
        this.storage.set('Favoritos', JSON.stringify(novaArr)); 

        this.favorito();

      })

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

  favorito(){
    this.storage.get('Favoritos').then((favoritos) => {
      
      var fav = JSON.parse(favoritos);

      if(!(fav instanceof Array))
          fav = [];

      if(fav.indexOf(this.id) == -1)
        this.favoritado = false;
      else
        this.favoritado = true;

      console.log("Favoritado", this.favoritado);
    })
  }

  pFeito(){
    this.storage.get('PratosFeitos').then((feitos) => {
      
      var f = JSON.parse(feitos);

      if(!(f instanceof Array))
          f = [];

      if(f.indexOf(this.id) == -1)
        this.feito = false;
      else
        this.feito = true;

      console.log("Feito", this.feito);
    })
  }

}
