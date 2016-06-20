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

app.controller('main_ctrl',function ($scope, $rootScope) {

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

app.controller('login_modal_ctrl',function ($scope, $uibModal, $rootScope, $state) {


    console.log('Current state2:'+$rootScope.previousState);
    $state.go($rootScope.previousState);

        $uibModal.open({

            templateUrl: 'login.html',
            controller: 'login_modal_instance_ctrl'

        });


});

app.controller('login_modal_instance_ctrl', function ($scope, $http, $uibModalInstance, $uibModal, $rootScope, $state) {
    
    
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
            .then(function (a) {

                if(a.data=="wrong")
                {
                    $scope.warning="Wrong credentials";
                }
                else {
                    console.log(a.data);

                    $rootScope.nickname = a.data;
                    
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

app.controller('register_ctrl', function ($scope, $http, $uibModalInstance, $uibModal, $rootScope) {

    $scope.register_submit = function () {

        console.log('email: '+$scope.email+' pass: '+$scope.password+' nickname: '+$scope.nickname);
        
        $http.post("db_insert.php", {'email' :$scope.email, 'password':$scope.password, 'nickname':$scope.nickname})
            .success(function () {
                console.log('usao');
                
                 $rootScope.nickname = $scope.nickname;
                $uibModalInstance.close();

                $uibModal.open({
                    templateUrl: 'login_success.html',
                    controller: 'login_success_ctrl'

                })
            })
            

    };
});