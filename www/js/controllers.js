angular.module('conFusion.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localStorage) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = $localStorage.getObject('userinfo','{}');

  //Form data for the Reservation modal
  $scope.reservation = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Create the reserve modal that we will use later
  $ionicModal.fromTemplateUrl('templates/reserve.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.reserveform = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    console.log('Doing login', $scope.loginData);
    $scope.modal.show();
  };

  // Triggered in the reserve modal to close it
  $scope.closeReserve = function() {
    $scope.reserveform.hide();
  };

  // Open the reserve modal
  $scope.reserve = function() {
    $scope.reserveform.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    $localStorage.storeObject('userinfo',$scope.loginData);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // Perform the reserve action when the user submits the reserve form
  $scope.doReserve = function() {
    console.log('Doing reservation', $scope.reservation);

    // Simulate a reservation delay. Remove this and replace with your reservation
    // code if using a server system
    $timeout(function() {
      $scope.closeReserve();
    }, 1000);
  };
})

  .controller('MenuController', ['$scope', 'dishes', 'menuFactory', 'favoriteFactory', 'baseURL', '$ionicListDelegate', function($scope, dishes, menuFactory, favoriteFactory, baseURL, $ionicListDelegate) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showMenu = true;
    $scope.message = "Loading ...";

    $scope.dishes = dishes;

    $scope.addFavorite = function (index) {
      console.log("index is " + index);
      favoriteFactory.addToFavorites(index);
      $ionicListDelegate.closeOptionButtons();
    }

    $scope.select = function(setTab) {
      $scope.tab = setTab;

      if (setTab === 2) {
        $scope.filtText = "appetizer";
      }
      else if (setTab === 3) {
        $scope.filtText = "mains";
      }
      else if (setTab === 4) {
        $scope.filtText = "dessert";
      }
      else {
        $scope.filtText = "";
      }
    };

    $scope.isSelected = function (checkTab) {
      return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function() {
      $scope.showDetails = !$scope.showDetails;
    };
  }])

  .controller('ContactController', ['$scope', function($scope) {

    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };

    var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

  }])

  .controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$state', '$stateParams', '$timeout', function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $state, $stateParams, $timeout) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;
    $scope.dishes = dishes;
    $scope.favorites = favorites;


    $scope.toggleDelete = function () {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
      console.log($scope.shouldShowDelete);
    };

    $scope.deleteFavorite = function (index) {

      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm Delete',
        template: 'Are you sure you want to delete this item?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log('Ok to delete');
          favoriteFactory.deleteFromFavorites(index);
          $state.transitionTo($state.current, $stateParams, {
            reload: true
          });
        } else {
          console.log('Canceled delete');
        }
      });

      $scope.shouldShowDelete = false;

    };
  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {

    $scope.sendFeedback = function() {

      console.log($scope.feedback);

      if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
        $scope.invalidChannelSelection = true;
        console.log('incorrect');
      }
      else {
        $scope.invalidChannelSelection = false;
        feedbackFactory.save($scope.feedback);
        $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
        $scope.feedback.mychannel="";
        $scope.feedbackForm.$setPristine();
        console.log($scope.feedback);
      }
    };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory', 'favoriteFactory', 'baseURL', '$ionicPopover', '$ionicModal', function ($scope, $stateParams, dish, menuFactory, favoriteFactory, baseURL, $ionicPopover, $ionicModal) {

    $scope.baseURL = baseURL;
    $scope.dish = dish;
    $scope.showDish = false;
    $scope.message="Loading ...";
    $scope.comment = {};

    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.commentModal = modal;
    });

    $scope.addComment = function() {
      $scope.commentModal.show();
    };

    $scope.submitComment  = function() {

      $scope.comment.date = new Date().toISOString();
      $scope.dish.comments.push($scope.comment);
      menuFactory.update({id:$scope.dish.id},$scope.dish);
      $scope.comment = {rating:5, comment:"", author:"", date:""};
      $scope.closeCommentModal();
    };

    $scope.$on('$destroy', function() {
      $scope.dishdetailPopover.remove();
    });

    $scope.addToFavorites = function() {
      favoriteFactory.addToFavorites($scope.dish.id);
      $scope.closePopover();
    };

    $scope.closePopover = function() {
      $scope.dishdetailPopover.hide();
    };

    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.dishdetailPopover = popover;
    });

    $scope.closeCommentModal = function() {
      $scope.closePopover();
      $scope.commentModal.hide();
    };

    $scope.dish = menuFactory.get({id:parseInt($stateParams.id,10)})
      .$promise.then(
        function(response){
          $scope.dish = response;
          $scope.showDish = true;
        },
        function(response) {
          $scope.message = "Error: "+response.status + " " + response.statusText;
        }
      );

    $scope.showPopover = function($event) {
      $scope.dishdetailPopover.show($event);
    };

  }])

  .controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {

    $scope.mycomment = {rating:5, comment:"", author:"", date:""};

    $scope.submitComment = function () {

      $scope.mycomment.date = new Date().toISOString();
      console.log($scope.mycomment);

      $scope.dish.comments.push($scope.mycomment);
      menuFactory.update({id:$scope.dish.id},$scope.dish);

      $scope.mycomment = {rating:5, comment:"", author:"", date:""};
    }
  }])

  .controller('IndexController', ['$scope', 'dish', 'menuFactory', 'promotion', 'promotionFactory', 'corporateFactory', 'baseURL', function ($scope, dish, menuFactory, promotion, promotionFactory, corporateFactory, baseURL) {

    $scope.baseURL = baseURL;
    $scope.leader = corporateFactory.get({
      id: 3
    });

    $scope.showDish = false;
    $scope.message = "Loading ...";

    $scope.dish = dish;

    $scope.promotion = promotionFactory.get({
      id: 0
    });

  }])

  .controller('AboutController', ['$scope', 'corporateFactory','baseURL','leaders', function($scope, corporateFactory, baseURL, leaders) {

    $scope.baseURL = baseURL;
    $scope.leaders = leaders;
    console.log($scope.leaders);

  }])

.filter('favoriteFilter', function () {
  return function (dishes, favorites) {
    var out = [];
    for (var i = 0; i < favorites.length; i++) {
      for (var j = 0; j < dishes.length; j++) {
        if (dishes[j].id === favorites[i].id)
          out.push(dishes[j]);
      }
    }
    return out;

  }
});
