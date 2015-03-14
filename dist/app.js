// Generated by CoffeeScript 1.9.0
(function() {
  var Gem, app;

  app = angular.module('gem-puzzle', ['ngAnimate']);


  /*
  Represents a polygonal jewel
   */

  Gem = (function() {
    function Gem(color, type) {
      this.color = color;
      this.type = type;
      this.exploded = false;
      this.highlight = false;
      this.points = this.getPolygonPoints();
    }

    Gem.prototype.getPolygonPoints = function() {
      var base, center, size, _i, _ref, _results;
      size = 200;
      center = size / 2;
      base = 2 * Math.PI / this.type;
      return ((function() {
        _results = [];
        for (var _i = 0, _ref = this.type; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(index) {
        var angle;
        angle = base * (index + 0.5);
        return ([center + center * Math.cos(angle), center + center * Math.sin(angle)].map(function(n) {
          return n.toFixed(0);
        })).join(' ');
      })).join(',');
    };

    return Gem;

  })();


  /*
  The type of gem determines how many angles it has
   */

  Gem.Types = [5, 6, 8, 12];


  /*
  The color of the gem
   */

  Gem.Colors = ['red', 'green', 'blue', 'yellow', 'violet'];

  app.controller('GemController', function($scope, $timeout) {
    var animationDuration, endGame, exploded, gems, getLinked, highlighted, isEndGame, matchNumber, randomGem, reorderGems, size, updateStats;
    matchNumber = 3;
    size = 8;
    gems = [];
    highlighted = [];
    exploded = [];
    animationDuration = 300;
    endGame = false;
    $scope.stats = {};
    $scope.restart = function() {
      var _i, _ref, _results, _results1;
      endGame = false;
      $scope.stats = {
        gems: 0,
        strings: 0,
        maxString: 0,
        totalScore: 0
      };

      /*
      Generate a board with at least one string of linked gems
       */
      _results = [];
      while (isEndGame()) {
        _results.push(gems = (function() {
          _results1 = [];
          for (var _i = 0, _ref = size * size; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results1.push(_i); }
          return _results1;
        }).apply(this).map(randomGem));
      }
      return _results;
    };

    /*
    Returns the list of gems for iteration
     */
    $scope.getGems = function() {
      return gems;
    };

    /*
    Checks if the game if over
     */
    $scope.isGameOver = function() {
      return endGame;
    };

    /*
    If the selected gem forms a string with adjusent gems of the
    same color, they get "exploded"
     */
    $scope.explode = function(gem) {
      exploded = getLinked(gem);
      if (exploded) {
        updateStats(exploded.length);
        exploded.forEach(function(index) {
          return gems[index].exploded = true;
        });
      }
      return $timeout(function() {
        exploded = null;
        reorderGems();
        return endGame = isEndGame();
      }, animationDuration);
    };

    /*
    Highlights a string of linked gems
     */
    $scope.highlightOn = function(gem) {
      var linked;
      linked = getLinked(gem);
      if (linked) {
        highlighted = linked.map(function(index) {
          return gems[index];
        });
        return highlighted.forEach(function(gem) {
          return gem.highlight = true;
        });
      }
    };

    /*
    Un-highlights previously highlighted gems
     */
    $scope.highlightOff = function() {
      highlighted.forEach(function(gem) {
        return gem.highlight = false;
      });
      return highlighted.length = 0;
    };

    /*
    Checks if a gem is the one initially selected
     */
    $scope.initiatedExplosion = function(gem) {
      return gem.exploded && gems[exploded[0]] === gem;
    };
    $scope.getExplodedCount = function() {
      return exploded && exploded.length;
    };

    /*
    Update statistical counters
     */
    updateStats = function(len) {
      $scope.stats.gems += len;
      $scope.stats.strings += 1;
      $scope.stats.maxString = Math.max(len, $scope.stats.maxString);
      return $scope.stats.totalScore += Math.pow(2, len) + len % 2;
    };

    /*
    Creates a gem with random type and color
     */
    randomGem = function() {
      return new Gem(Gem.Colors[Math.floor(Math.random() * Gem.Colors.length)], Gem.Types[Math.floor(Math.random() * Gem.Types.length)]);
    };

    /*
    Reorders the gems so that the exploded gems are replaced
    with the gems from the line above
     */
    reorderGems = function() {
      var _i, _ref, _results;
      gems.forEach(function(gem, index) {
        if (gem.exploded) {
          return gems[index] = null;
        }
      });
      return (function() {
        _results = [];
        for (var _i = _ref = size * size - 1; _ref <= 0 ? _i <= 0 : _i >= 0; _ref <= 0 ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).forEach(function(index) {
        var gem, upperIndex;
        gem = gems[index];
        if (!gem) {
          upperIndex = index;
          while (upperIndex >= size && !gem) {
            upperIndex = upperIndex - size;
            gem = gems[upperIndex];
            gems[upperIndex] = null;
          }
          if (gem) {
            return gems[index] = new Gem(gem.color, gem.type);
          } else {
            return gems[index] = randomGem();
          }
        }
      });
    };

    /*
    Gets a string of subsequent gems of the same color.
    The string can be a straight line or a polyline,
    but not a diagonal line
     */
    getLinked = function(firstGem) {
      var gem, index, linked, queue;
      linked = [];
      queue = [gems.indexOf(firstGem)];
      while (queue.length) {
        index = queue.pop();
        if (linked.indexOf(index) === -1) {
          gem = gems[index];
          if (gem && gem.color === firstGem.color) {
            linked.push(index);
            if (index === 0 || (index + 1) % size) {
              queue.push(index + 1);
            }
            if (index % size) {
              queue.push(index - 1);
            }
            queue.push(index + size);
            queue.push(index - size);
          }
        }
      }
      if (linked.length >= matchNumber) {
        return linked;
      }
    };

    /*
    Checks end game conditions
     */
    return isEndGame = function() {
      return !gems.some(function(gem) {
        return getLinked(gem);
      });
    };
  });

}).call(this);
