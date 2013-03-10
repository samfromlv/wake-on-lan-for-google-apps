# Wake on Lan for Google Apps

Secure solution to wake PC in internal network using Google Apps script deployed as web application
and nodejs backend service. This will allow you to wake your PC without connecting to VPN and if you use 
Chrome Remote Desktop escape from using VPN at all.

Google Apps script:

* Allows users to save their mac address and with single button click wake PC
* If deployed on Google Site should set to be accessable only by domain users
    
Nodejs Wake service:

* Accepts requests from Google servers and wakes PCs sending magic packets
* Verifies validity of all requests using hashing
* Should be located in the same network as wake targets
    
#Installation

Google Apps script

1. Clone git repo
2. cd googleService
3. ./build.sh

This will create two files in googleService/deploy folder which should be uploaded to you Apps script.
* backend.gs
* ui.html

Next you need to create two settings for your Google Apps script. 
Make sure you create them under Project Properites not User Proprties.
* wake_service_url - URL of your nodejs service that you deploy after a bit
* wake_service_secret - Random string used to sign requests set to wake service.

Nodejs wake service

Configure settings in config.js
* secret - same as wake_service_secret setting for Google Apps script
* port - listen on this port
* ip - use this interface

Start service
        node server.js
    





