var app = 
{
    watchId: '',
    localData: [],
    initMode: false,
    sendingMode: false,
    debugMode: window.tinyHippos != undefined,
    
    configuration:
    {
        server:
        {
           ip: '127.0.0.1',
           path: '/slp/server/'
        },
        accuracy: 20,
        frequency: 1000
    },
    
    counters:
    {
        sent: 0,
        error: 0,
        quality: 0,
        received: 0,
        measured: 0
    },
    
    data:
    {
        connection:
        {
            type: 0,
            connected: false
        },
        device:
        {
            uuid: '',
            model: '',
            system:
            {
                version: '',
                platform: ''
            },
            screen:
            {
                depth: 0,
                width: 0,
                height: 0
            }
        },
        acceleration:
        {
            x: 0,
            y: 0,
            z: 0,
            orientation: 0,
            watchId: '',
            hasError: false
        },
        geolocation:
        {
            latitude: 0,
            longitude: 0,
            speed: 0,
            heading: 0,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            watchId: '',
            hasError: false
        }
    },
    
    init: function()
	{
        app.initMode = true;
        
        document.addEventListener('deviceready', app.deviceReadyHandler, false);
    },
	
    deviceReadyHandler: function()
	{
        /**
         * Actual handler, to handle app's exits (back button press).
         * 
         * With fix for nasty bug of Ripple having deadly old PhoneGap 2.0.0 behind!
         */
        if(!app.debugMode) document.addEventListener("backbutton", app.backButtonHandler, true);
        
        /**
         * PhoneGap events handlers.
         */
        document.addEventListener('batterylow', app.batteryLowHandler, false);
        document.addEventListener('batterystatus', app.batteryStatusHandler, false);
        document.addEventListener('batterycritical', app.batteryCriticalHandler, false);
        document.addEventListener('online', app.onlineHandler, false);
        document.addEventListener('offline', app.offlineHandler, false);
        
        $(window).bind('reorient', app.onReorient);
        $.reorient.start();
        app.onReorient();
        
        /**
         * Other events binding.
         */
        $(document).on('click', '#sendButton', app.onSendButtonClick);
        $(document).on('click', '#clearButton', app.onClearButtonClick);
        $(document).on('click', '#startButton', app.onStartButtonClick);
        $(document).on('click', '#configButton', app.onConfigButtonClick);
        
        /**
         * We're starting to roll...
         */
        app.readLocalData();
        app.getDeviceInfo();
        app.connectionHandler('');
    },
	
    /**
     * Event Handlers
     */
    backButtonHandler: function()
	{
        navigator.notification.confirm
		(
            'Czy jeste\u015B pewien, \u017Ce chcesz zako\u0144czy\u0107 dzia\u0142anie aplikacji?' + "\n\n" + 'Dane nie b\u0119d\u0105 przesy\u0142ane do \u015Bled\u017A.to!' + "\n\n" + 'Je\u015Bli chcesz wyj\u015B\u0107 z programu, ale pozostawi\u0107 wysy\u0142anie danych w tle -- u\u017Cyj klawisza \"Home\" zamiast \"Back\".',
            app.onExitConfirm,
            'Zako\u0144czy\u0107 prac\u0119?',
            'Kontynuuj, Zako\u0144cz'
        );
    },
	
    onlineHandler: function(){app.connectionHandler('online')},
    offlineHandler: function(){app.connectionHandler('offline')},
    batteryLowHandler: function(info){app.batteryHandler('low', info);},
    batteryStatusHandler: function(info){app.batteryHandler('status', info);},
    batteryCriticalHandler: function(info){app.batteryHandler('critical', info);},
	
    connectionHandler: function(type)
	{
        var 
            connectionType = '',
            connectionString = '',
            previousConnectionState = app.data.connection.connected;
    
        app.data.connection.connected = app.isConnected();
        app.data.connection.type = app.getConnectionType();
        
        connectionType = app.getConnectionName(app.data.connection.type);
        connectionString = ((app.data.connection.connected ? 'dost\u0119p' : 'brak dost\u0119pu') + ' do Internetu') + ((app.data.connection.connected) ? ' [<strong>' + connectionType + '</strong>]' : ' [<strong>zapis lokalny</strong>]');
        
        app.setLabel('connection', connectionString);
        
        if(!app.data.connection.connected)
        {
            app.failedCheck('server');
            app.failedCheck('connection');
            app.setLabel('server', connectionString);                    
        }
        else
        {
            app.passedCheck('connection');
            
            if(previousConnectionState === false) app.checkServer();
        }
    },
    
    batteryHandler: function(type, info)
	{

    },
    
    /**
     * Callbacks
     */
	onReorient: function()
	{
        var percentage = ($.reorient.orientation === 'landscape') ? 50 : 100;
        
        app.data.acceleration.orientation = ($.reorient.orientation === 'landscape') ? 'l' : 'p';
        
        $('.the-box').css('width', percentage + '%');
        
        $('#statsBox').css('height', $('#toolsBox').css('height'));
	},
    
	onExitConfirm: function(button)
	{
		if(button == 2)
        {
            app.stopWatches();
            
            navigator.app.exitApp();
        }
	},
    
    onConfigButtonClick: function()
    {
        if($('#configButton').hasClass('disabled')) return false;
        
        alert('Funkcja nie zaimplementowana!');
    },
    
    onSendButtonClick: function()
    {
        var
            i = 0,
            c = app.localData.length
                
        if($('#sendButton').hasClass('disabled')) return false;
        
        if(app.data.connection.connected)
        {
            if(c > 0)
            {
                for(i = 0; i < c; ++i)
                {
                    app.sendData(app.localData[i]);
                    
                    $('#sentPackagesCount').html(++app.counters.sent);
                }
            }
            else alert('Brak danych lokalnych do wys\u0142ania!');
        }
        else alert('Brak po\u0142\u0105czenia z Internetem!');
    },
    
    onClearButtonClick: function()
    {
        if($('#clearButton').hasClass('disabled')) return false;
        
        if(confirm('Lokalnie zapisane dane NIE zosta\u0142y wys\u0142ane na serwer. Czy na pewno je wyczy\u015Bci\u0107? Ta operacja jest nieodwracalna!')) app.clearLocalData();
        
        /**
         * I REALLY HATE, that Ripple is SO OLD!
         */
//        navigator.notification.confirm
//		(
//            'Lokalnie zapisane dane NIE zosta\u0142y wys\u0142ane na serwer. Czy na pewno je wyczy\u015Bci\u0107? Ta operacja jest nieodwracalna!',
//            app.clearLocalData,
//            'Wyczy\u015B\u0107',
//            'Anuluj'
//        );
    },
    
    onAccelerationSuccess: function(acceleration)
    {
        app.data.acceleration.x = acceleration.x;
        app.data.acceleration.y = acceleration.y;
        app.data.acceleration.z = acceleration.z;
        
        app.data.acceleration.orientation = ($.reorient.orientation === 'landscape') ? 'l' : 'p';
        
        app.data.acceleration.hasError = false;
        
        app.passedCheck('acceleration');
    },
    
    onAccelerationError: function()
    {
        app.data.acceleration.hasError = true;
        
        app.setIcon('acceleration', 'icon-info', 'text-info');
        app.setLabel('acceleration', 'dane z szybko\u015Bciomierza s\u0105 niedost\u0119pne');
    },
    
    onGeolocationSuccess: function(position)
    {
        var
            acc = 0,
            latitude = position.coords.latitude || 0,
            longitude = position.coords.longitude || 0,
            speed = position.coords.speed || 0,
            heading = position.coords.heading || 0,
            altitude = position.coords.altitude || 0,
            accuracy = position.coords.accuracy || 0,
            altitudeAccuracy = position.coords.altitudeAccuracy || 0;
        
        /**
         * Data
         */
        app.data.geolocation.latitude = latitude.toFixed(6);
        app.data.geolocation.longitude = longitude.toFixed(6);
        app.data.geolocation.speed = speed.toFixed(4);
        app.data.geolocation.heading = heading.toFixed(2);
        app.data.geolocation.altitude = altitude.toFixed(2);
        app.data.geolocation.accuracy = accuracy.toFixed(2);
        app.data.geolocation.altitudeAccuracy = altitudeAccuracy.toFixed(2);
        
        if(app.data.geolocation.hasError === true)
        {
            app.showBox('Odzyskano sygna\u0142 GPS...', 'message');
            
            app.data.geolocation.hasError = false;
        }
        
        /**
         * Status update
         */
        app.setIcon('geolocation', 'icon-info', 'text-info');
        
        if(position.coords.accuracy)
        {
            acc = accuracy.toFixed(0);
            
            if(acc <= app.configuration.accuracy)
            {
                app.setIcon('geolocation', 'icon-check-sign', 'text-success');
                app.setLabel('geolocation', 'lokalizacja dost\u0119pna [dok\u0142adno\u015B\u0107: <strong>' + acc + '</strong>]');
            }
            else app.setLabel('geolocation', 'lokalizacja niedok\u0142adna [dok\u0142adno\u015B\u0107: <strong>' + acc + '</strong>]');
        }
        else app.setLabel('geolocation', 'lokalizacja chwilowo niedost\u0119pna [dok\u0142adno\u015B\u0107: <strong>0</strong>]');
        
        if(!app.sendingMode)
        {
            /*
             * We're done with init routine!
             */
            app.initMode = false;

            app.toggleSendingData();
        }
    },
    
    onGeolocationError: function(PositionError)
    {
        var errorMessage = 'nieznany b\u0142\u0105d';
            
        if(PositionError.code === PositionError.POSITION_UNAVAILABLE) errorMessage = 'brak danych GPS';
        if(PositionError.code === PositionError.TIMEOUT) errorMessage = 'przekroczony dopuszczalny czas';
        if(PositionError.code === PositionError.PERMISSION_DENIED) errorMessage = 'brak autoryzacji u\u017Cytkownika';
        
        app.data.geolocation.hasError = true;
        
        app.showBox('Utrata sygna\u0142u GPS!', 'message');
        
        app.failedCheck('geolocation');
        app.setLabel('geolocation', 'GPS: ' + errorMessage);
        
        /**
         * Do NOT stop watches, if there is a geolocation error!
         */
//        app.stopWatches();
//        app.sendingMode = false;
//        app.toggleButtonsState(true);
    },
    
    /**
     * Getters and setters.
     */
    getDeviceInfo: function()
    {
        app.data.device.uuid = device.uuid || '';
        app.data.device.model = device.model || '';
        app.data.device.system.version = device.version || ''
        app.data.device.system.platform = device.platform || '';
        app.data.device.screen.depth = screen.pixelDepth || 0;
        app.data.device.screen.width = screen.availWidth || 0;
        app.data.device.screen.height = screen.availHeight || 0;
    },
    
    /**
     * General app-related functions.
     */
    readLocalData: function()
    {
        var lc = window.localStorage.getItem('localData');

        if(lc !== null) app.localData = JSON.parse(lc);
        
        $('#localPackagesCount').html(app.localData.length);
        
        if(app.localData.length > 0)
        {
            $('#localDataBlock').show();
        }
        else $('#localDataBlock').hide();
    },
    
    writeLocalData: function(data)
    {
        app.localData.push(data);
        lc = JSON.stringify(app.localData);

        window.localStorage.setItem('localData', lc);

        $('#localPackagesCount').html(app.localData.length);
    },
    
    clearLocalData: function()
    {
        window.localStorage.removeItem('localData');
        
        $('#localDataBlock').hide();
        
        app.localData = [];
        
        $('#localPackagesCount').html(app.localData.length);
    },
    
    toggleSendingData: function()
    {
        var
            toggleButton = $('#startButton'),
            off = (toggleButton.attr('data-state') === 'off');
            
        app.sendingMode = off;
        
        if(off)
        {
            $('#localDataBlock').hide();
            
            toggleButton.find('span').text('Stop');
            toggleButton.attr('data-state', 'on');
            
            app.toggleButtonsState(true);
            $('#configButton').addClass('disabled');
            
            app.counters.sent = 0;
            app.counters.error = 0;
            app.counters.quality = 0;
            app.counters.received = 0;
            app.counters.measured = 0;
            
            app.watchId = window.setInterval(app.mainLoop, app.configuration.frequency);
        }
        else
        {
            $('#lastErrorMessage').html('brak');
            $('.errorPackagesBlock').hide();
            
            toggleButton.find('span').text('Start');
            toggleButton.attr('data-state', 'off');
            $('#configButton').removeClass('disabled');
            
            app.initCheckList();
            app.stopWatches();
            
            window.clearTimeout(app.watchId);
            
            app.readLocalData();
        }
    },
    
    mainLoop: function()
    {
        var
            data = {},
            geolocationFine = (app.data.geolocation.hasError === false && (app.data.geolocation.accuracy <= app.configuration.accuracy && app.data.geolocation.accuracy > 0));
    
        app.connectionHandler('');
    
        /**
         * Do anything only, if there is some acceleration data or geolocation has
         * good quality. Don't send complete garbage (partial garbage can be send! :]).
         */
        if(app.data.acceleration.hasError === false || geolocationFine)
        {
            /**
             * Prepare data, update counters.
             */
            data = app.prepareAJAXData();
            
            $('#measuredPackagesCount').html(++app.counters.measured);
            if(geolocationFine) $('#goodQualityPackagesCount').html(++app.counters.quality);
            
            /**
             * Send data to server or save it locally'
             */
            if(app.data.connection.connected)
            {
                $('#sentPackagesCount').html(++app.counters.sent);
                
                app.sendData(data);
            }
            else app.writeLocalData(data);
        }
    },
    
    sendData: function(data)
    {
        var
            serializedData = '',
            serverIP = app.configuration.server.ip,
            url = 'http://' + serverIP + app.configuration.server.path + 'gateway.php';
    
        serializedData = 'request=add&' + $.param(data);
        
//        window.prompt('request', url + '?' + serializedData);
    
        $.ajax
        ({
            type : "GET",
            dataType : "json",
            url : url,
            data : serializedData,
            success: function(response)
            {
                if(response)
                {
                    result = app.parseServerResponse(response);

                    if(!result.failed)
                    {
                        app.sendoutResponseSuccess();
                    }
                    else app.sendoutResponseFail(result.error);
                }
                else app.sendoutResponseFail('otrzymano pusty wynik');
            },
            error: function(){app.sendoutResponseFail('b\u0142\u0105d po\u0142\u0105czenia -- b\u0142\u0105d XHR')}
        });
    },
    
    sendoutResponseSuccess: function()
    {
        $('#receivedPackagesCount').html(++app.counters.received);
    },
    
    sendoutResponseFail: function(error)
    {
        $('#errorPackagesCount').html(++app.counters.error);
        
        $('#lastErrorMessage').html(error);
        $('.errorPackagesBlock').show();
    },
    
    startWatches: function()
    {
        var geolocationOptions =
        {
            timeout: 120000,
            maximumAge: 3000,
            enableHighAccuracy: true
        };
            
        app.startCheck('geolocation');
        
        app.data.geolocation.watchId = navigator.geolocation.watchPosition(app.onGeolocationSuccess, app.onGeolocationError, geolocationOptions);
        app.data.acceleration.watchId = navigator.accelerometer.watchAcceleration(app.onAccelerationSuccess, app.onAccelerationError, {frequency: 100});
    },
    
    stopWatches: function()
    {
        navigator.geolocation.clearWatch(app.data.geolocation.watchId);
        navigator.accelerometer.clearWatch(app.data.acceleration.watchId);
    },
    
    initCheckList: function()
    {
        app.clearCheck('server');
        app.clearCheck('connection');
        app.clearCheck('geolocation');
        
        app.setLabel('server', 'po\u0142\u0105czenie z serwerem');
        app.setLabel('connection', 'dost\u0119p do Internetu');
        app.setLabel('geolocation', 'dane geolokalizacyjne');
    },
    
    onStartButtonClick: function()
	{
        /**
         * Ignore and return, if button is disabled.
         */
        if($('#startButton').hasClass('disabled')) return false;
        
        /**
         * If button is "on", turn it off and disable sending data.
         */
        if($('#startButton').attr('data-state') === 'on')
        {
            app.toggleSendingData();
            
            return false;
        }
            
        /**
         * Init
         */
        app.sendingMode = false;
        
        app.initCheckList();
        app.toggleButtonsState(false);
            
        app.connectionHandler('');
        
        app.startWatches();
    },
    
    checkServer: function()
    {
        var
            serverIP = app.configuration.server.ip,
            serverUrl = 'http://' + serverIP + app.configuration.server.path + 'gateway.php';
    
        app.startCheck('server');
        app.setLabel('server', 'po\u0142\u0105czenie z serwerem <strong>' + serverIP + '</strong>');
    
        $.ajax
        ({
            type: "GET",
            dataType: "json",
            url: serverUrl,
            data: {request: 'check'},
            success: function(response)
            {
                if(response)
                {
                    result = app.parseServerResponse(response);

                    if(!result.failed)
                    {
                        app.passedCheck('server');
                    }
                    else app.initResponseFail(result.error);
                }
                else app.initResponseFail('otrzymano pusty wynik');
            },
            error: function(){app.initResponseFail('b\u0142\u0105d po\u0142\u0105czenia -- b\u0142\u0105d XHR')}
        });
    },
    
    parseServerResponse: function(response)
    {
        var result = 
        {
            failed: (response.status !== 'success'),
            error: ''
        };

        if(result.failed)
        {
            if(response.status === 'down')
            {
                result.error = 'serwer wy\u0142\u0105czony';
            }
            else if(response.status === 'error')
            {
                result.error = response.error;
            }
            else result.error = 'nieprawid\u0142owy wynik';
        }
        
        return result;
    },
    
    initResponseFail: function(error)
    {
        app.failedCheck('server');
        app.setLabel('server', error);
        
        app.toggleButtonsState(true);
    },
    
    getConnectionType: function()
    {
        /**
         * Ripple Emulator (used in debugging) has very, very old PhoneGap 2.0.0 
         * behind and checks connection type from different object.
         * 
         * Change from navigator.network.connection to navigator.connection was introduced
         * in PhoneGap 2.2.0.
         */
        var networkState = ((navigator.connection) ? navigator.connection.type : ((navigator.network && navigator.network.connection) ? navigator.network.connection.type : 'unknown'));

        return networkState;
    },            
    
    getConnectionName: function(networkState)
    {
        var states = {};
        
        states[Connection.NONE]     = 'brak';
        states[Connection.WIFI]     = 'WiFi';
        states[Connection.CELL_2G]  = 'GPRS 2G';
        states[Connection.CELL_3G]  = 'GPRS 3G';
        states[Connection.CELL_4G]  = 'GPRS 4G';
        states[Connection.ETHERNET] = 'Ethernet';
        states[Connection.UNKNOWN]  = 'nieznane';
        states[Connection.CELL]     = 'GPRS inne';

        return states[networkState];
    },            
    
    isConnected: function()
    {
        /**
         * See note for app.getConnectionType();
         */
        var networkState = ((navigator.connection) ? navigator.connection.type : ((navigator.network && navigator.network.connection) ? navigator.network.connection.type : 'unknown'));
        
        return networkState !== 'unknown' && networkState !== 'none';
    },
    
    playAudio: function(file)
    {
        /**
         * Fix for Android platform
         * 
         * https://gist.github.com/alunny/2380994
         */
        if(device.platform === 'Android') file = '/android_asset/www/' + file;
		
        var media = new Media(file, function(){}, function()
        {
            apprise('app.playAudio() failed for "' + file + '"!', {});
        });
		
        media.play();
    },
    
    /**
     * Other functions -- internal, supporting and helpers.
     */
    getElementFullName: function(element, ending)
    {
        return '#check' + element.charAt(0).toUpperCase() + element.slice(1) + ending;
    },

    startCheck: function(element)
    {
        var el = app.getElementFullName(element, 'Icon');
        
        $(el).removeClass('icon-question');
        $(el).addClass('icon-spinner icon-spin');
    },

    failedCheck: function(element)
    {
        app.setIcon(element, 'icon-remove-sign', 'text-error');
    },

    passedCheck: function(element)
    {
        app.setIcon(element, 'icon-check-sign', 'text-success');
    },
    
    clearCheck: function(element)
    {
        app.setIcon(element, 'icon-check-empty', 'text-default');
    },

    clearIcon: function(image)
    {
        $(image).removeClass();
        $(image).addClass('icon-li');
    },
    
    clearLabel: function(label)
    {
        $(label).removeClass();
    },
    
    setIcon: function(element, icon, color)
    {
        var
            image = app.getElementFullName(element, 'Icon'),
            label = app.getElementFullName(element, 'Label');

        app.clearIcon(image);
        $(image).addClass(icon + ' ' + color);

        app.clearLabel(label);
        $(label).addClass(color);
    },
    
    setLabel: function(element, text)
    {
        var label = app.getElementFullName(element, 'Label');
        
        $(label).html(text);
    },
    
    flattenData: function(o)
    {
        //http://stackoverflow.com/a/18109677/1469208
        
        var
            name,
            out = arguments[2] || {},
            prefix = arguments[1] || "";

        for (name in o)
        {
            if (o.hasOwnProperty(name))
            {
                typeof o[name] === "object" ? app.flattenData(o[name], prefix + name + '.', out) : out[prefix + name] = o[name];
            }
        }
        
        return out;
    },
    
    dataObjectToString: function(o)
    {
        var
            name,
            out = '';

        for (name in o)
        {
            if (o.hasOwnProperty(name))
            {
                out = out + name + ' = ' + o[name] + "<br />";
            }
        }
        
        return out;
    },
    
    toggleButtonsState: function(enable)
    {
        if(enable)
        {
            $('#startButton').removeClass('disabled');
            $('#configButton').removeClass('disabled');
            
            $('#toggleSending').removeClass('disabled');
        }
        else
        {
            $('#startButton').addClass('disabled');
            $('#configButton').addClass('disabled');
            
            $('#toggleSending').addClass('disabled');
        }
    },
    
    showBox: function(text, type)
    {
        var
            messageBox = $('#' + type + 'Box'),
            messageText = $('#' + type + 'Text');
            
        messageText.html(text);
        
        messageBox.css
        ({
            display: 'table',
            opacity: 0
        }).animate({
            opacity: 1
        }, 300, 'linear', function()
        {
            setTimeout
            (
                function() 
                {
                    messageBox.css
                    ({
                        opacity: 1
                    }).animate({
                        opacity: 0
                    }, 300, 'linear', function()
                    {
                        messageBox.css('display', 'none');
                    });
                }, 3000
            );
        });
    },
    
    timestampToFormattedString: function(timestamp)
    {
        var
            date = new Date(timestamp),
            m = date.getMonth() + 1,
            month = (m > 9) ? m : '0' + m,
            day = (date.getDate() > 9) ? date.getDate() : '0' + date.getDate(),
            hours = (date.getHours() > 9) ? date.getHours() : '0' + date.getHours(),
            minutes = (date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes(),
            seconds = (date.getSeconds() > 9) ? date.getSeconds() : '0' + date.getSeconds();
                
        return date.getFullYear() + '-' +
            month  + '-' +
            day + ', ' +
            hours + ':' +
            minutes + ':' +
            seconds;
    },
    
    prepareAJAXData: function()
    {
        var
            data = {},
            date = new Date(),
            connectionType = app.getConnectionType(),
            isGPRS = (connectionType !== 'ethernet' && connectionType !== 'wifi');
            
        data = 
        {
            timestamp: date.getTime(),
            latitude: app.data.geolocation.latitude,
            longitude: app.data.geolocation.longitude,
            speed: app.data.geolocation.speed,
            heading: app.data.geolocation.heading,
            altitude: app.data.geolocation.altitude,
            accuracy: app.data.geolocation.accuracy,
            battery: 100,
            signal: 100,
            imei: app.data.device.uuid,
            gps: true,
            gprs: isGPRS,
            xacceleration: app.data.acceleration.x,
            yacceleration: app.data.acceleration.y,
            zacceleration: app.data.acceleration.z,
            orientation: app.data.acceleration.orientation
        };
        
        return data;
    },
};

app.init();