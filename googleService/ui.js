$(function() {
    ctrl.setup();
    $('#loadingSpinner').hide();
    $('#all').show();
});

var ctrl = (function() {
    // @exclude
    /*
    // @endexclude
    var delegate = google.script.run;
    // @exclude
    */
    // @endexclude
    
    // @exclude
    function testDelegate() {
        var sCb;
        var eCb;
        var result;

        function withSuccessHandler(cb) {
            sCb = cb;
            return this;
        }

        function withFailureHandler(cb) {
            eCb = cb;
            return this;
        }

        function wake() {
            if (sCb) setTimeout(sCb, 3000, {});

        }

        function setup() {
            if (sCb) setTimeout(sCb, 3000, {
                mac: 'A0:11:22:33:44:55'
            });
        }

        function saveSettings(mac) {
            if (sCb) setTimeout(sCb, 3000, {});
        }

        return {
            withSuccessHandler: withSuccessHandler,
            withFailureHandler: withFailureHandler,
            setup: setup,
            wake: wake,
            saveSettings: saveSettings
        };
    }
    var delegate = testDelegate();
    // @endexclude 

    var macAddress = '';

    function setup() {
        $('#wakeButton').click(function() {
            $('#wakeStatus').hide();
            $('#wakeSpinner').show();
            delegate.withSuccessHandler(function(status) {
                if (!status.error) {
                    showWakeStatus('Wake packet sent');
                }
                else {
                    showWakeError('Error while sending request - ' + status.error);
                }
            }).withFailureHandler(function(error) {
                showWakeError('Connection error - ' + error);
            }).wake();
        });

        $('#settingsLink').click(function() {
            showSettingsPanel();
            return false;
        });

        function unhideWakeStatus(panel) {
            $('#wakeSpinner').hide();
            panel.show();
        }

        function showWakeStatus(status, error) {
            var statusPanel = $('#wakeStatus');
            unhideWakeStatus(statusPanel);
            statusPanel.addClass('statusOk');
            statusPanel.removeClass('statusError');
            statusPanel.text(status);
        }

        function showWakeError(error) {
            var statusPanel = $('#wakeStatus');
            unhideWakeStatus(statusPanel);
            statusPanel.removeClass('statusOk');
            statusPanel.addClass('statusError');
            statusPanel.text(error);
        }

        function showWakePanel() {
            $('#settingsPanel').hide();
            $('#wakeSpinner').hide();
            $('#wakeStatus').hide();

            $('#wakePanel').show();
        }

        function showSettingsPanel() {
            $('#wakePanel').hide();

            if (!macAddress || macAddress.length === 0) {
                $('#cancel').hide();
            }
            else {
                $('#cancel').show();
            }
            $('#save').show();
            $('#macValidation').hide();
            $('#macAddress').val(macAddress);
            $('#settingsSpinner').hide();

            $('#settingsPanel').show();
        }


        $('#cancel').click(function() {
            showWakePanel();
        });

        $('#save').click(function() {
            var newMac = $('#macAddress').val().toUpperCase();
            if (newMac == macAddress) {
                showWakePanel();
                return;
            }


            var regex = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/i;
            if (!regex.test(newMac)) {
                $('#macValidation').show();
                $('macAddress').focus();
                return;
            }
            $('#macValidation').hide();
            $('#settingsSpinner').show();
            $('#save').hide();
            $('#cancel').hide();
            delegate.withSuccessHandler(function(status) {
                if (!status.error) {
                    macAddress = newMac;
                    showWakePanel();
                    showWakeStatus('Settings saved');
                }
                else
                {
                    showWakePanel();
                    showWakeError('Error while saving settings - ' + status.error);
                }
            }).withFailureHandler(function(error) {
                $('settingsSpinner').hide();
                $('save').show();
                $('cancel').show();
                alert('Error occured while saving settings. Please try again.');
            }).saveSettings({mac:newMac});
        });

        $('#settingsPanel').hide();
        $('#wakeButton').hide();
        $('#settingsLink').hide();
        $('#wakeStatus').hide();
        $('#wakePanel').show();
        $('#wakeSpinner').show();

        delegate.withSuccessHandler(function(data) {
            if (!data.error) {
                macAddress = data.mac;
                $('#wakeButton').show();
                $('#wakeSpinner').hide();
                $('#settingsLink').show();
                if (!macAddress || macAddress.length === 0) {
                    showSettingsPanel();
                }
            }
            else
            {
                showWakeError("Setting loading error - " + data.error);
            }
        }).withFailureHandler(function(error) {
            showWakeError("Connection error - " + error + ". Please refresh this page.");
        }).setup();
    }
    return {
        setup: setup
    };
})();
