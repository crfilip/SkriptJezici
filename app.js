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

        .state('home.lost', {
            url: '/lost',

            views: {
                '': {templateUrl: 'partial-home-lost.html'},

                'lostThings_view@home.lost': {
                    templateUrl: 'partial-home-lost-lostThings.html',
                    controller: 'collapse_ctrl_L1'

                },

                'lostSomething_view@home.lost': {
                    templateUrl: 'partial-home-lost-lostSomething.html',
                    controller: 'collapse_ctrl_L2'
                }
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
//
// app.provider('modalState', function($stateProvider) {
//     var provider = this;
//     var modalResult;
//     this.$get = function() {
//         return provider;
//     };
//     this.state = function(stateName, options) {
//         var modalInstance;
//         $stateProvider.state(stateName, {
//             url: options.url,
//             onEnter: ['$modal', '$state', function($modal, $state) {
//                 modalInstance = $modal.open(options);
//                 // When the modal uses $close({..}), the data (=result) will be assigned to the parent state as 'modalResult'.
//                 modalInstance.result.then(function(result) {
//                     modalResult = result;
//                 }).finally(function() { // modal closes
//                     if(modalResult) {
//                         $state.get('^').modalResult = modalResult;
//                     }
//                     modalInstance = modalResult = null;
//                     if ($state.$current.name === stateName) {
//                         $state.go('^'); // go to parent state
//                     }
//                 });
//             }],
//             onExit: function() {
//                 if (modalInstance) {
//                     modalInstance.close();
//                 }
//             }
//         });
//         return provider;
//     };
// });

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

app.controller('main_ctrl',function ($state, Messages,Session,$scope, $rootScope, $http, $uibModal, anchorSmoothScroll) {

    $rootScope.currentState = $state.$current;


    $rootScope.$on('$stateChangeStart', function(event, to, toParams, from) {

        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        console.log('Previous state:'+$rootScope.previousState);
        console.log('Current state:'+$rootScope.currentState);
    });

    $scope.inputs = {
        'category': ['documents','electronics','clothing','pets','drugs','other']
    };
    $scope.isCollapsed = false;
    var sesija = Session.get('user');

    $rootScope.showMap_found=false;
    $rootScope.showMap_lost=false;
    $rootScope.showMap_lost_things=false;

    if(sesija==null){

        $rootScope.log = 'Log in';
        $rootScope.reg = 'Register';

    }else{

        Messages.user({ name : Session.get('nickname')});
        console.log("User:" +Session.get('nickname') );
        $rootScope.log = 'Log out';
        $rootScope.reg = '';

    }

    //odavde krece rutiranje za LOGIN
    $scope.log_in_modal = function () {

        var sesija = Session.get('user');


        if (sesija == null) {
            console.log(sesija);



            $uibModal.open({

                templateUrl: 'login.html',
                controller: 'login_modal_instance_ctrl'

            });
        } else {

            Session.kill('user');
             $rootScope.log = 'Log in';
            $rootScope.reg = 'Register';

            $uibModal.open({
                templateUrl: 'logout_success.html',
                controller: 'logout_success_ctrl'

            })
        }
    }
    //rutiranje za REGISTER
    $scope.register_modal = function () {



        $uibModal.open({
            templateUrl: 'register.html',
            controller: 'register_ctrl'
        })
    }




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
        
        if($scope.isCollapsed_L1)$rootScope.showMap_lost_things=true;
        else $rootScope.showMap_lost_things=false;

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

    $scope.gotoElement = function (eID){
        // set the location.hash to the id of
        // the element you wish to scroll to.
       // $location.hash('bottom');

        // call $anchorScroll()
        anchorSmoothScroll.scrollTo(eID);

    };


});

app.service('anchorSmoothScroll', function(){

    this.scrollTo = function(eID) {

        // This scrolling function
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        console.log(distance);
        var speed = Math.round(distance /100);
        if (speed >= 20) speed = 20;
        var step = 100;
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", 0);
                leapY += step;
                if (leapY > stopY) leapY = stopY;
                timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", 0);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }

        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }

        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };

});

app.controller( 'collapse_ctrl_L1', function ($scope,$http,$rootScope) {

    $scope.map = { center: { latitude: 44.8206, longitude: 20.4622 }, zoom: 8 };

    $scope.options = {
        scrollwheel: false
    };
    $scope.markers = [];
    var markers = [];

    $rootScope.aa=function(){
        console.log("aa");
    };

    $scope.filter_map=function($index){
        console.log($index);
        $rootScope.refreshMap($index);

    };

    document.getElementById('search').onkeypress = function() {
        setTimeout(function(){
            $rootScope.refreshMap(document.getElementById('search').value);
        },100)

    };
        //magijom prosledjuje ove parametre
    $scope.onClick = function(marker, eventName, model) {
        for(i=0;i<$scope.markers.length;i++){
            if( $scope.markers[i].id !== model.id)
                 $scope.markers[i].show=false;
        }
        console.log(model.show);
        model.show = !model.show;
    };

    $rootScope.refreshMap = function(category){
        markers=[];
        $http.post("db_lost_things.php",{'category':category}).then(function(data){

            console.log(data.data);
            var array = data.data.split('|');
            for(i=0;i<array.length-1;i++){

                var latlon = array[i].split(",");
                var marker = {
                    latitude: latlon[0],
                    longitude: latlon[1],
                    id:i,
                    title:'finder: '+latlon[2]+' <br/> item name: '+latlon[3]+'<br/> category: '+$scope.inputs['category'][latlon[4]],
                    show:false
                };
                markers.push(marker);
            }
        });
        console.log( markers);

        $scope.markers=markers;

    };

    $rootScope.refreshMap(-1);


});

app.controller('collapse_ctrl_L2', function ($scope,$http,Session,$rootScope) {

    if (Session.get('user') == null){

        $rootScope.logIn_warning="You need to ";
        $rootScope.register_warning="Dont have an account? ";
        $rootScope.logIn_anchor="Log in";
        $rootScope.register_anchor="Register";

    }else{
        $rootScope.logIn_warning="";
        $rootScope.register_warning="";
        $rootScope.logIn_anchor="";
        $rootScope.register_anchor="";

    }


    $scope.map = { center: { latitude: 44.8206, longitude: 20.4622 }, zoom: 8 };

    $scope.options = {
        scrollwheel: false
    };

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


   // $scope.outputs = {};
    // $scope.setOutput = function(typeKey, $index, value) {
    //
    //
    //     $scope.outputs[typeKey] = $scope.outputs[typeKey] || [];
    //
    //     if($scope.outputs[typeKey][$index] == value){
    //
    //         $scope.outputs[typeKey][$index] = null;
    //
    //     }
    //     else  $scope.outputs[typeKey][$index] = value;
    //
    //     console.log('itemz:'+ $scope.outputs[typeKey]+"  $index "+$index+"  value "+value);
    // };
    var index;
    //submit function
    $scope.lost_something_index = function ($index){

        index=$index;
    };

    $scope.lost_something= function() {

        var x = document.getElementsByName("bratina");
        var bool=false;
        for (i = 0; i < x.length; i++) {
            if(x[i].checked){
                bool=true;
            }
        }
        if(!bool) return;
        if (Session.get('user') == null) {

        }
        else {
            $http.post("db_add_lost.php", {
                'user': Session.get('user'),
                'nickname': Session.get('nickname'),
                'itemName': $scope.itemName,
                'category': index,
                'description': $scope.description,
                'latitude': $scope.marker.coords.latitude,
                'longitude': $scope.marker.coords.longitude
            })
                .then(function (user) {
                    $rootScope.refreshMap(-1);
                    $scope.gotoElement('lostThings');
                    $scope.isCollapsed_L2=false;
                    $rootScope.isCollapsed_L1 = true;
                        console.log( $rootScope.isCollapsed_L2 );
                    if($scope.isCollapsed_L1)$rootScope.showMap_lost_things=true;
                    else $rootScope.showMap_lost_things=false;
                    // // treba da se doda samo popup uspesno dodavanje / neuspesno dodavanje, ali dodavanje radi &&
                    //     if(user.data=="wrong")
                    //     {
                    //         ;
                    //     }
                    //     else {
                    //
                    //         var fields = user.data.split(" ");
                    //         console.log(fields[0]);
                    //         Session.set('user',fields[1]);
                    //         Session.set('log',"Log out");
                    //         Session.set('nickname',fields[0]);
                    //         $rootScope.nickname = fields[0];
                    //         $rootScope.log = 'Log out';
                    //
                    //         Messages.user({ name : Session.get('nickname')});
                    //         console.log("User:" +Session.get('nickname') );
                    //         $uibModalInstance.close();
                    //
                    //         $uibModal.open({
                    //             templateUrl: 'login_success.html',
                    //             controller: 'login_success_ctrl'
                    //
                    //         })
                    //     }
                })
        }
    }

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
//
// app.controller('login_modal_ctrl',function (Session,$scope, $uibModal, $rootScope, $state) {
//
//     $rootScope.log_state = $rootScope.previousState;
//
//     var sesija = Session.get('user');
//
//     if(sesija==null){
//         console.log(sesija);
//          // $state.go($rootScope.previousState);
//
//         $uibModal.open({
//
//             templateUrl: 'login.html',
//             controller: 'login_modal_instance_ctrl'
//
//         });
//     }else{
//         Session.kill('user');
//         $rootScope.log = 'Log in';
//         // $state.go($rootScope.previousState);
//         $uibModal.open({
//             templateUrl: 'logout_success.html',
//             controller: 'logout_success_ctrl'
//
//         })
//     }
//
//
//
// });

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
                    $rootScope.nickname = fields[0];
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

app.controller('login_success_ctrl', function ($scope, $uibModalInstance, $state, $rootScope) {

    $scope.exit = function () {
    console.log("login state: "+$rootScope.currentState);
        // $state.reload($rootScope.currentState);
        $rootScope.logIn_warning="";
        $rootScope.register_warning="";
        $rootScope.logIn_anchor="";
        $rootScope.register_anchor="";
        $rootScope.reg = '';
        $uibModalInstance.close();
    }
});
app.controller('logout_success_ctrl', function ($scope, $uibModalInstance, $state, $rootScope) {

    $scope.exit = function () {
        console.log("login state: "+$rootScope.currentState);
        $rootScope.logIn_warning="You need to ";
        $rootScope.register_warning="Dont have an account? ";
        $rootScope.logIn_anchor="Log in";
        $rootScope.register_anchor="Register";
        // $state.reload($rootScope.currentState);
        $rootScope.reg = 'Register';
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
