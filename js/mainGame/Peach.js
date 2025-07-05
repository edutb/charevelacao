// Peach.js
function Peach() {
  var gameUI = GameUI.getInstance();

  this.x;
  this.y;
  this.width = 73; // Ajuste para a largura do sprite da Peach
  this.height = 99; // Ajuste para a altura do sprite da Peach
  this.sX = 0; // Coordenada X inicial do sprite (se for uma folha de sprites)
  this.sY = 0; // Coordenada Y inicial do sprite

  var peachSprite; // Objeto Image para o sprite da Peach
  var that = this;

  this.init = function() {
    // Posição inicial ao lado do Mario
    that.x = 10 + 40; // Exemplo: Mario.x (10) + Mario.width (32, aprox.) + algum espaçamento (8) = 50px
    that.y = gameUI.getHeight() - 40 - 48; // gameUI.getHeight() - (altura do chão) - (altura da Peach)

    peachSprite = new Image();
    peachSprite.src = 'images/peach.png'; // Caminho para o seu arquivo peach.png
  };

  this.draw = function() {
    //gameUI.draw(peachSprite, that.sX, that.sY, that.width, that.height, that.x, that.y, that.width, that.height);
  };

  // Se a Peach precisar de animação ou movimento, adicione um método update() aqui.
  // Por enquanto, ela será estática.
  // this.update = function() {
  //   // Lógica de atualização da Peach, se houver.
  // };
}