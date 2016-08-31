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

//Chat controller, ubacio sam clear chat funkciju samo, inace ostaju poruke sacuvane u bazi iz API-a tako da uvek mozemo da im pristupimo
app.controller( 'chat', [ '$http','Messages','$rootScope', '$scope','Session',
    function( $http,Messages, $scope, $rootScope,Session ) {

        // Message Inbox
        $scope.allMessages = [];

        // Receive Messages
        // Messages.receive(function(message){
        //     console.log(message);
        //
        //         $rootScope.messages.push(message);
        //
        //
        // });
        Messages.receive(function(message){
            $scope.allMessages.push(message);
            console.log("received ");
            console.log(message);
        });
        // Send Messages
        $scope.clear = function() {
            $scope.allMessages.length = 0;

        };

        $scope.send = function() {


            if($rootScope.finder!=Messages.user().id ){
                if( $rootScope.chatUsers!==undefined){
                    if( !$rootScope.chatUsers.includes($rootScope.finder)){
                        $http.post("openChat.php", {
                            'user': Messages.user().id,
                            'finder': $rootScope.finder
                        })
                            .then(function (data) {
                                if(data.data==="Success"){
                                    $rootScope.chatUsers.push($rootScope.finder);
                                }
                            });

                    }
                    $("#MyChatMessages").val("");
                }

                Messages.send({ data : "~"+$rootScope.textbox, to : $rootScope.finder });
                Messages.send({ data : $rootScope.finder+"~"+$rootScope.textbox, to : Messages.user().id });
                $rootScope.filterMessages();

                console.log("iznad mene filter");
            }

        };
    } ] );


app.controller('main_ctrl',function ($state, Messages,Session,$scope, $rootScope, $http, $uibModal, anchorSmoothScroll) {

    $rootScope.filterMessages = function(){
        console.log( $scope.allMessages);
        $rootScope.messages.length = 0;
        var str="";
        $scope.allMessages.forEach(function(msg){
            // Ignore messages without User Data
            // TODO
            if (!(msg.data && msg.user && msg.user.id)) return;
            var niz = msg.data.split("~");
            var fajnder = niz[0];
            var data = niz[1];
            if(fajnder == ""){

                if ($rootScope.finder !=Messages.user().id && $rootScope.finder == msg.user.id ){
                    $rootScope.messages.push({
                        data : msg.data
                        ,   id   : msg.id
                        ,   user : msg.user
                        ,   self : msg.user.id == Messages.user().id
                    });
                }
            }else {
                if (($rootScope.finder !=Messages.user().id) && ( $rootScope.finder == fajnder )){
                   
                    $rootScope.messages.push({
                        data : msg.data
                        ,   id   : msg.id
                        ,   user : msg.user
                        ,   self : msg.user.id == Messages.user().id
                    });
                }
            }



        });
        $rootScope.messages.forEach(function(msg){
            var conc = msg.data.split("~");
            str+=msg.user.name+":"+conc[1]+"</br>";
        });
        $(".chat-box-messages").html(str);
    }
    $rootScope.chatUsers = [];
    $rootScope.currentState = $state.$current;

    $rootScope.messages = [];
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

    // $scope.checkSession = function () {
    //     var sesija = Session.get('user');
    //
    //     if(sesija==null)
    //     {
    //         console.log("sranje");
    //         return false;
    //     }else {
    //         return true;
    //     }
    // }

    if(sesija==null){

        $rootScope.log = 'Log in';
        $rootScope.reg = 'Register';
        $rootScope.chatValue = false;
        $rootScope.chatboxValue = false;
        $rootScope.chatShow = false;


    }else{

        Messages.user({ name : Session.get('nickname')});
        Messages.user().id=Session.get('nickname');
        $rootScope.log = 'Log out';
        $rootScope.reg = '';
        $rootScope.chatValue = true;
        $rootScope.chatboxValue = true;
        // $rootScope.chatShow = true;
        $http.post("checkChat.php", {
            'user': Messages.user().id
        })
            .then(function (data) {
                var niz = data.data.split("|");
                niz.forEach(function(usr){
                    if(usr!==Messages.user().id && usr!==""){
                        $rootScope.chatUsers.push(usr);
                    }
                });
            });

    }

    $scope.chatWith=function(who){
        $rootScope.finder = who;
        $rootScope.filterMessages();

    };

    $scope.chat_button = function () {


       // $(".chat").hasClass("collapsed-chat")?$(".chat").removeClass("collapsed-chat"):$(".chat").addClass("collapsed-chat");

        $rootScope.chatboxValue=false;
        $rootScope.chatShow = true;
            // $(".chat").replaceWith("<div class='chat-box' >" +
            //     "<div class='chat-box-messages'></div>" +
            //     " <div class='my-chat-messages form-group'>" +
            //     "<form ng-submit='send()'>" +
            //     "<input ng-model='textbox' type='text' class='form-control' id='MyChatMessages'>" +
            //     "<button type='submit' class='submit-chat'>Send</button>" +
            //     "</form>" +
            //     "</div>" +
            //     "</div>");

            // str= $(".submit-chat").text();



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
    };
    //rutiranje za REGISTER
    $scope.register_modal = function () {



        $uibModal.open({
            templateUrl: 'register.html',
            controller: 'register_ctrl'
        })
    };




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

        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 250);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
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
            }
            console.log("y "+y);
            return y;

        }

    };

});

app.controller( 'collapse_ctrl_L1', function ($scope,$http,$rootScope,Messages) {

    $scope.map = { center: { latitude: 44.8206, longitude: 20.4622 }, zoom: 8 };

    $scope.options = {
        scrollwheel: false
    };
    $scope.markers = [];
    var markers = [];


    $scope.filter_map=function($index){
        console.log($index);
        $rootScope.refreshMap($index);

    };


    document.getElementById('search').onclick = function() {
        var ele = document.getElementsByName("filter");
        for(var i=0;i<ele.length;i++)
            ele[i].checked = false;

       setTimeout(function(){
            $rootScope.refreshMap(document.getElementById('search').value);
        },100)

    };

    document.getElementById('search').onkeydown = function() {
        var ele = document.getElementsByName("filter");
        for(var i=0;i<ele.length;i++)
            ele[i].checked = false;
        setTimeout(function(){
            $rootScope.refreshMap(document.getElementById('search').value);
        },100)

    };

    $scope.clickEventsObject = {
        mouseover: onMouseOver,
        click: onClick,
        mouseout: onMouseOut
    };

    
    function onClick(marker, eventName, model) {

        $rootScope.finder =  $scope.markers[model.id].finder;
        $scope.itemName = $scope.markers[model.id].itemName;
        $scope.description = $scope.markers[model.id].description;
        $rootScope.filterMessages();


    }

    function onMouseOver (marker, eventName, model) {
        console.log("mouseOver");
        for(i=0;i<$scope.markers.length;i++) {

            if ($scope.markers[i].id !== model.id) {
                $scope.markers[i].show = false;
            }
            else {

                model.show = true;

            }
        }

    }

    function onMouseOut(marker, eventName, model)
    {
        model.show = false;
    }

    $rootScope.refreshMap = function(category){
        markers=[];

        $http.post("db_lost_things.php",{'category':category}).then(function(data){

            var array = data.data.split('|');

            for(i=0;i<array.length-1;i++){

                var latlon = array[i].split("~");
                var marker = {

                    latitude: latlon[0],
                    longitude: latlon[1],
                    id:i,
                    finder : latlon[2],
                    itemName : latlon[3],
                    description: latlon[5],
                    title:'finder: '+latlon[2]+' <br/> item name: '+latlon[3]+'<br/> category: '+$scope.inputs['category'][latlon[4]],

                    show:false
                };
                markers.push(marker);
            }
        });


        $scope.markers=markers;


    };

    $rootScope.refreshMap(-1);


});

app.controller('collapse_ctrl_L2', function ($scope,$http,Session,$rootScope,$timeout) {



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
                    $timeout(function(){
                        document.getElementById("lostThings").click();
                        document.getElementById("lostSomething").click();
                    });

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
                    Messages.user().id=Session.get('nickname');
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

app.controller('login_success_ctrl', function (Messages,$http,$scope, $uibModalInstance, $state, $rootScope) {

    $rootScope.reg = '';
    $rootScope.chatValue=true;
    $rootScope.chatboxValue=true;

    $http.post("checkChat.php", {
        'user': Messages.user().id
    })
        .then(function (data) {
            $rootScope.chatUsers.length=0;
            var niz = data.data.split("|");
            niz.forEach(function(usr){
                if(usr!==Messages.user().id && usr!==""){
                    $rootScope.chatUsers.push(usr);
                }
            });
        });

    $scope.exit = function () {
    console.log("login state: "+$rootScope.currentState);

        
        $uibModalInstance.close();
    }
});
app.controller('logout_success_ctrl', function ($scope, $uibModalInstance, $state, $rootScope) {

    $rootScope.reg = 'Register';
    $rootScope.chatValue=false;
    $rootScope.chatboxValue=false;
    $rootScope.chatShow=false;

    $scope.exit = function () {
        console.log("login state: "+$rootScope.currentState);


        
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
