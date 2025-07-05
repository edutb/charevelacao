function Fireball() {
  var gameUI = GameUI.getInstance();

  var element = new Image();
  element.src = 'images/fire.png'; // You'll need to create this image

  this.x;
  this.y;
  this.velY = 7; // Initial downward velocity
  this.width = 30; // Adjust as needed
  this.height = 30; // Adjust as needed

  var that = this;

  this.init = function(x, y) {
    that.x = x;
    that.y = y;
  };

  this.draw = function() {
    gameUI.draw(element, 0, 0, that.width, that.height, that.x, that.y, that.width, that.height);
  };

  this.update = function() {
    that.y += that.velY;
  };
}