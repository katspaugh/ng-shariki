// Generated by CoffeeScript 1.9.0
(function() {
  var Gem, app;

  app = angular.module('gem-puzzle', ['ngAnimate']);


  /*
  Represents a polygonal jewel
   */

  Gem = (function() {
    Gem.prototype.viewBox = 200;

    function Gem(color, type) {
      this.color = color;
      this.type = type;
      this.exploded = false;
      this.points = this.getPolygonPoints();
    }

    Gem.prototype.getPolygonPoints = function() {
      var base, center, _i, _ref, _results;
      center = this.viewBox / 2;
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
    var animationDuration, cols, exploded, getLinked, isEndGame, matchNumber, randomGem, reorderGems, rows, updateStats;
    matchNumber = 3;
    animationDuration = 100;
    exploded = [];
    cols = 6;
    rows = 11;

    /*
    Scope variables
     */
    $scope.gems = [];
    $scope.size = 50;
    $scope.cols = cols;
    $scope.endGame = false;
    $scope.stats = {};

    /*
    Calculates columns and the size of gems and starts the game
     */
    $scope.init = function(width, height) {
      var maxCols, size;
      maxCols = rows;
      size = Math.floor(height / rows);
      cols = Math.min(maxCols, Math.floor(width / size));
      $scope.size = size;
      $scope.cols = cols;
      return $scope.restart();
    };
    $scope.restart = function() {
      var _i, _ref, _results, _results1;
      $scope.endGame = false;
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
        _results.push($scope.gems = (function() {
          _results1 = [];
          for (var _i = 0, _ref = rows * cols; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results1.push(_i); }
          return _results1;
        }).apply(this).map(randomGem));
      }
      return _results;
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
          return $scope.gems[index].exploded = true;
        });
      }
      return $timeout(function() {
        exploded = null;
        reorderGems();
        return $scope.endGame = isEndGame();
      }, animationDuration);
    };

    /*
    Checks if a gem is the one initially selected
     */
    $scope.initiatedExplosion = function(gem) {
      return gem.exploded && $scope.gems[exploded[0]] === gem;
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
      $scope.gems.forEach(function(gem, index) {
        if (gem.exploded) {
          return $scope.gems[index] = null;
        }
      });
      return (function() {
        _results = [];
        for (var _i = _ref = rows * cols - 1; _ref <= 0 ? _i <= 0 : _i >= 0; _ref <= 0 ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).forEach(function(index) {
        var gem, upperIndex;
        gem = $scope.gems[index];
        if (!gem) {
          upperIndex = index;
          while (upperIndex >= cols && !gem) {
            upperIndex = upperIndex - cols;
            gem = $scope.gems[upperIndex];
            $scope.gems[upperIndex] = null;
          }
          if (gem) {
            return $scope.gems[index] = new Gem(gem.color, gem.type);
          } else {
            return $scope.gems[index] = randomGem();
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
      queue = [$scope.gems.indexOf(firstGem)];
      while (queue.length) {
        index = queue.pop();
        if (linked.indexOf(index) === -1) {
          gem = $scope.gems[index];
          if (gem && gem.color === firstGem.color) {
            linked.push(index);
            if (index === 0 || (index + 1) % cols) {
              queue.push(index + 1);
            }
            if (index % cols) {
              queue.push(index - 1);
            }
            queue.push(index + cols);
            queue.push(index - cols);
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
      return !$scope.gems.some(function(gem) {
        return getLinked(gem);
      });
    };
  });

  app.directive('gemInit', function($window) {
    return {
      restrict: 'A',
      link: function($scope) {
        return $scope.init($window.innerWidth - 50, $window.innerHeight - 100);
      }
    };
  });

}).call(this);
