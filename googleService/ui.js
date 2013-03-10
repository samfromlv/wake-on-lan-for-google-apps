$(function() {
    ctrl.setup();
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
            showSpinner('#wakeSpinner');
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
            hideSpinner();
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
            hideSpinner();
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
            hideSpinner();

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
            showSpinner('#settingsSpinner');
            $('#save').hide();
            $('#cancel').hide();
            delegate.withSuccessHandler(function(status) {
                if (!status.error) {
                    macAddress = newMac;
                    showWakePanel();
                    showWakeStatus('Settings saved');
                }
                else {
                    showWakePanel();
                    showWakeError('Error while saving settings - ' + status.error);
                }
            }).withFailureHandler(function(error) {
                showWakePanel();
                showWakeError('Error occured while saving settings. Please try again.');
            }).saveSettings({
                mac: newMac
            });
        });

        delegate.withSuccessHandler(function(data) {
            $('#all').show();

            if (!data.error) {
                macAddress = data.mac;
                $('#wakeButton').show();
                $('#wakeSpinner').hide();
                $('#settingsLink').show();
                if (!macAddress || macAddress.length === 0) {
                    showSettingsPanel();
                }
                else {
                    showWakePanel();
                }
            }
            else {
                showWakeError("Settings load error - " + data.error);
            }
        }).withFailureHandler(function(error) {
            $('#all').show();
            showWakeError("Connection error - " + error + ". Please refresh this page.");
        }).setup();

        var spinner = {
            timeout: 0,
            id: null,
            count: 0
        };


        function showSpinner(id) {
            hideSpinner();

            spinner = {
                id: id,
                count: 1
            };
            spinner.timeout = setInterval(function() {
                var text = '';
                for (var i = 0; i < spinner.count; i++) {
                    text += '.';
                }
                $(spinner.id).text(text);
                if (spinner.count < 5) spinner.count++;
                else spinner.count = 0;
            }, 200);
            $(spinner.id).show();
        }

        function hideSpinner() {
            if (spinner) {
                clearInterval(spinner.timeout);
                spinner = null;
            }
            $('#loadingSpinner').hide();
            $('#settingsSpinner').hide();
            $('#wakeSpinner').hide();
        }

        showSpinner('#loadingSpinner');
    }
    return {
        setup: setup
    };
})();
