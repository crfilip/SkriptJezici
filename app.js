/**
 * Created by Filip on 5/18/2016.
 */

var app = angular.module('LFapp', ['ui.router','ui.bootstrap', 'ngAnimate']);



app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');


    $stateProvider
        .state('home',{
          url: '/home',
          templateUrl: 'partial-home.html',
            controller: 'main_ctrl'
        })

        .state('home.logIn',{
            url:'',
            controller: 'login_modal_ctrl'
        })

        .state('home.lost',{
            url:'/lost',
            views: {   
                '':{ templateUrl : 'partial-home-lost.html'},

                'lostSomething_view@home.lost' : {
                    templateUrl : 'partial-home-lost-lostSomething.html',
                    controller: 'collapse_ctrl_L1'},

                'lostThings_view@home.lost' :  {
                    templateUrl : 'partial-home-lost-lostThings.html',
                    controller: 'collapse_ctrl_L2'}
            }
            
        })

        .state('home.found',{
            url:'/found',
            views: {
                '':{ templateUrl : 'partial-home-found.html'},

                'foundSomething_view@home.found' : {
                    templateUrl : 'partial-home-found-foundSomething.html',
                    controller: 'collapse_ctrl_F1'},

                'foundThings_view@home.found' :  {
                    templateUrl : 'partial-home-found-foundThings.html',
                    controller: 'collapse_ctrl_F2'}
            }

        })
    
});

app.controller('main_ctrl',function (Session,$scope, $rootScope) {
    var sesija = Session.get('user');
    if(sesija==null){
        $rootScope.log = 'Log in';
    }else{
        $rootScope.log = 'Log out';
    }

    $rootScope.previousState;
    $rootScope.currentState ;
    $rootScope.$on('$stateChangeStart', function(event, to, toParams, from) {

        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        console.log('Previous state:'+$rootScope.previousState);
        console.log('Current state:'+$rootScope.currentState);
    });

});
app.controller('collapse_ctrl_L1', function ($scope) {

    $scope.isCollapsed_L1 = false;
    
});


app.controller('collapse_ctrl_L2', function ($scope) {

    $scope.isCollapsed_L2 = false;

});

app.controller('collapse_ctrl_F1', function ($scope) {

    $scope.isCollapsed_F1 = false;

});


app.controller('collapse_ctrl_F2', function ($scope) {

    $scope.isCollapsed_F2 = false;

});

app.controller('login_modal_ctrl',function (Session,$scope, $uibModal, $rootScope, $state) {

    var sesija = Session.get('user');

    if(sesija==null){
        console.log(sesija);
        $state.go($rootScope.previousState);

        $uibModal.open({

            templateUrl: 'login.html',
            controller: 'login_modal_instance_ctrl'

        });
    }else{
        Session.kill('user');
        $rootScope.log = 'Log in';
    }



});

app.controller('login_modal_instance_ctrl', function (Session,$scope, $http, $uibModalInstance, $uibModal, $rootScope, $state) {


    $scope.register = function () {
        $uibModalInstance.close();


        $uibModal.open({
            templateUrl: 'register.html',
            controller: 'register_ctrl'
        })
    };

    $scope.log_in = function () {
        
        console.log('email:'+$scope.email+' pass:'+$scope.password);
        $http.post("db_login.php", {'email' :$scope.email, 'password':$scope.password})
            .then(function (user) {

                if(user.data=="wrong")
                {
                    $scope.warning="Wrong credentials";
                }
                else {
                    console.log(user.data);
                    Session.set('user',user.data);
                    $rootScope.log = 'Log out';
                    $rootScope.nickname = user.data;
                    $uibModalInstance.close();

                    $uibModal.open({
                        templateUrl: 'login_success.html',
                        controller: 'login_success_ctrl'

                    })
                }
            })

    };

    $scope.exit = function () {

        $uibModalInstance.close();
    }

});

app.controller('login_success_ctrl', function ($scope, $uibModalInstance) {

    $scope.exit = function () {

        $uibModalInstance.close();
    }
});

app.controller('register_ctrl', function (Session,$scope, $http, $uibModalInstance, $uibModal, $rootScope) {

    $scope.register_submit = function () {

        console.log('email: '+$scope.email+' pass: '+$scope.password+' nickname: '+$scope.nickname);
        
        $http.post("db_insert.php", {'email' :$scope.email, 'password':$scope.password, 'nickname':$scope.nickname})
            .success(function () {

                Session.set('user',user.data);
                $rootScope.log = 'Log out';
                 $rootScope.nickname = $scope.nickname;
                $uibModalInstance.close();

                $uibModal.open({
                    templateUrl: 'login_success.html',
                    controller: 'login_success_ctrl'

                })
            })
            

    };
});

app.factory('Session', function($http) {

    return{
        set:function(key,value){
            return sessionStorage.setItem(key,value);
        },
        get:function(key){
            return sessionStorage.getItem(key);
        },kill:function(key){
            return sessionStorage.removeItem(key);
        }
    };
});