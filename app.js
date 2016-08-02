/**
 * Created by Filip on 5/18/2016.
 */

var app = angular.module('LFapp', ['ui.router','ui.bootstrap', 'ngAnimate', 'uiGmapgoogle-maps','chat']).constant( 'config', {
    //
    // Get your PubNub API Keys in link below phone demo.
    //
    "pubnub": {
        "publish-key"   : "pub-c-29487e55-bb3b-4bea-a01e-b412d1d7df83",
        "subscribe-key" : "sub-c-84ed3c5a-5807-11e6-8457-02ee2ddab7fe"
    }
} );

//nemoj pusovati jebeni workspace, jeeeeebiii gaaaaa
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

                'lostThings_view@home.lost' : {
                    templateUrl : 'partial-home-lost-lostThings.html',
                    controller: 'collapse_ctrl_L1'},

                'lostSomething_view@home.lost' :  {
                    templateUrl : 'partial-home-lost-lostSomething.html',
                    controller: 'collapse_ctrl_L2'}
            }
            
        })

        .state('home.found',{
            url:'/found',
            views: {
                '':{ templateUrl : 'partial-home-found.html'},

                'foundThings_view@home.found' : {
                    templateUrl : 'partial-home-found-foundThings.html',
                    controller: 'collapse_ctrl_F1'},

                'foundSomething_view@home.found' :  {
                    templateUrl : 'partial-home-found-foundSomething.html',
                    controller: 'collapse_ctrl_F2'}
            }

        })
    
});

//Chat controller, ubacio sam clear chat funkciju samo, inace ostaju poruke sacuvane u bazi iz API-a tako da uvek mozemo da im pristupimo
app.controller( 'chat', [ 'Messages', '$scope','Session',
    function( Messages, $scope, $rootScope,Session ) {
        // Message Inbox
        $scope.messages = [];
        // Receive Messages
        Messages.receive(function(message){
            $scope.messages.push(message);
        });

        // Send Messages
        $scope.send = function() {
            Messages.send({ data : $scope.textbox });
        };
        $scope.clear = function() {
            $scope.messages.length = 0;

        };
    } ] );

app.controller('main_ctrl',function (Messages,Session,$scope, $rootScope, $http) {



    $scope.isCollapsed = false;
    var sesija = Session.get('user');

    $rootScope.showMap_found=false;
    $rootScope.showMap_lost=false;

    if(sesija==null){
        $rootScope.log = 'Log in';
    }else{
        Messages.user({ name : Session.get('nickname')});
        console.log("User:" +Session.get('nickname') );
        $rootScope.log = 'Log out';
    }



    $rootScope.$on('$stateChangeStart', function(event, to, toParams, from) {

        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        console.log('Previous state:'+$rootScope.previousState);
        console.log('Current state:'+$rootScope.currentState);
    });

    // ima ng-if na map elementu(u foundSomething.html) koji zavisi od showMap, prikazuje je ili ne, odnosno kad je true iscrtava ispocetka i ne bude sivo
    //funkcije za preload i cuvanje elemenata kao sto su showMap i collapse vrenosti, i sta god bude trebalo
    $scope.load_foundThings = function () {

        $scope.isCollapsed_F1 = !$scope.isCollapsed_F1;
        console.log("iscollaps "+$scope.isCollapsed_F1);

    };
    $scope.load_foundSomething = function (){

        $scope.isCollapsed_F2 = !$scope.isCollapsed_F2;

        if($scope.isCollapsed_F2)$rootScope.showMap_found=true;
        else $rootScope.showMap_found=false;

        console.log("showmap_lost "+$rootScope.showMap_lost);
        console.log("showmap_found "+$rootScope.showMap_found);

    };

    $scope.load_lostThings = function (){

        $scope.isCollapsed_L1 = !$scope.isCollapsed_L1;
        console.log("iscollaps "+$scope.isCollapsed_L1);
    };
    $scope.load_lostSomething = function (){

        $scope.isCollapsed_L2 = !$scope.isCollapsed_L2;

        if($scope.isCollapsed_L2)$rootScope.showMap_lost=true;
        else $rootScope.showMap_lost=false;


        console.log("showmap_lost "+$rootScope.showMap_lost);
        console.log("showmap_found "+$rootScope.showMap_found);
        console.log("iscollaps "+$scope.isCollapsed_L2);

    };


});
app.controller( 'collapse_ctrl_L1', function ($scope) {


    
});


app.controller('collapse_ctrl_L2', function ($scope) {




    $scope.map = { center: { latitude: 44.8206, longitude: 20.4622 }, zoom: 8 };

    $scope.marker = {
        id: 0,
        coords: {
            latitude: 44.8206,
            longitude: 20.4622
        },
        options: { draggable: true },
        events: {
            dragend: function (marker, eventName, args) {
                console.log('marker dragged');
                var lat = marker.getPosition().lat();
                var lon = marker.getPosition().lng();
                console.log(lat);
                console.log(lon);

                $scope.marker.options = {
                    draggable: true,
                    labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
                    labelAnchor: "100 0",
                    labelClass: "marker-labels"
                };
            }
        }
    };

    $scope.searchbox = {
        template:'searchbox.tpl.html',
        events:{
            places_changed: function (searchBox) {
                var places = searchBox.getPlaces();
                var place = places[0];
                $scope.map = {
                    center:{
                        latitude:place.geometry.location.lat(),
                        longitude:place.geometry.location.lng()
                    },
                    zoom:10
                };

                // refresh the marker
                $scope.marker = {
                    id:0,
                    options:{ draggable:true },
                    coords:{
                        latitude:place.geometry.location.lat(),
                        longitude:place.geometry.location.lng()
                    }
                };
            }
        }
    };


    $scope.outputs = {};
    $scope.inputs = {
        'category': ['documents','electronics','clothing','pets','drugs','other']
    };
    $scope.setOutput = function(typeKey, $index, value) {


        $scope.outputs[typeKey] = $scope.outputs[typeKey] || [];

        if($scope.outputs[typeKey][$index] == value){

            $scope.outputs[typeKey][$index] = null;

        }
        else  $scope.outputs[typeKey][$index] = value;

        console.log('itemz:'+ $scope.outputs[typeKey]+"  $index "+$index+"  value "+value);
    };

    //submit function
    $scope.found_something = function (){

        console.log("SUBMITTED");


    };

});

app.controller('collapse_ctrl_F1', function ($scope) {




});


app.controller('collapse_ctrl_F2', function ($scope) {






    $scope.map = { center: { latitude: 44.8206, longitude: 20.4622 }, zoom: 8 };

    $scope.marker = {
        id: 0,
        coords: {
            latitude: 44.8206,
            longitude: 20.4622
        },
        options: { draggable: true },
        events: {
            dragend: function (marker, eventName, args) {
                console.log('marker dragged');
                var lat = marker.getPosition().lat();
                var lon = marker.getPosition().lng();
                console.log(lat);
                console.log(lon);

                $scope.marker.options = {
                    draggable: true,
                    labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
                    labelAnchor: "100 0",
                    labelClass: "marker-labels"
                };
            }
        }
    };

    $scope.searchbox = {
        template:'searchbox.tpl.html',
        events:{
            places_changed: function (searchBox) {
                var places = searchBox.getPlaces();
                var place = places[0];
                $scope.map = {
                    center:{
                        latitude:place.geometry.location.lat(),
                        longitude:place.geometry.location.lng()
                    },
                    zoom:10
                };

                // refresh the marker
                $scope.marker = {
                    id:0,
                    options:{ draggable:true },
                    coords:{
                        latitude:place.geometry.location.lat(),
                        longitude:place.geometry.location.lng()
                    }
                };
            }
        }
    };


    $scope.outputs = {};
    $scope.inputs = {
        'category': ['documents','electronics','clothing','pets','drugs','other']
    };
    $scope.setOutput = function(typeKey, $index, value) {


        $scope.outputs[typeKey] = $scope.outputs[typeKey] || [];

        if($scope.outputs[typeKey][$index] == value){

            $scope.outputs[typeKey][$index] = null;

        }
        else  $scope.outputs[typeKey][$index] = value;

        console.log('itemz:'+ $scope.outputs[typeKey]+"  $index "+$index+"  value "+value);
    };

    //submit function
    $scope.found_something = function (){

        console.log("SUBMITTED");


    };

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
        $state.go($rootScope.previousState);
        $uibModal.open({
            templateUrl: 'logout_success.html',
            controller: 'logout_success_ctrl'

        })
    }



});

app.controller('login_modal_instance_ctrl', function (Messages,Session,$scope, $http, $uibModalInstance, $uibModal, $rootScope, $state) {


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

                    var fields = user.data.split(" ");
                    console.log(fields[0]);
                    Session.set('user',fields[1]);
                    Session.set('log',"Log out");
                    Session.set('nickname',fields[0]);
                    $rootScope.log = 'Log out';

                    Messages.user({ name : Session.get('nickname')});
                    console.log("User:" +Session.get('nickname') );
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
app.controller('logout_success_ctrl', function ($scope, $uibModalInstance) {

    $scope.exit = function () {

        $uibModalInstance.close();
    }
});

app.controller('register_ctrl', function ($scope, $http, $uibModalInstance, $uibModal, $rootScope) {

    $scope.register_submit = function () {

        console.log('email: '+$scope.email+' pass: '+$scope.password+' nickname: '+$scope.nickname);
        
        $http.post("db_insert.php", {'email' :$scope.email, 'password':$scope.password, 'nickname':$scope.nickname})
            .then(function (data) {
                $rootScope.registracija = data.data;

                $uibModalInstance.close();

                $uibModal.open({
                    templateUrl: 'register_success.html',
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