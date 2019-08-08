

    //Construct the logger that is used by the iframe.
    //Use in the same manner as the Zlux Logger.
      const parent = new Logger();
      parent.addDestination(parent.makeDefaultDestination(true,true,true));
      const logger = new ComponentLogger(parent, "iframe app");
      parent.setLogLevelForComponentName("iframe app", 4);
      console.log("log level for iframeapp", parent.getComponentLevel("iframe app"));
      console.log(logger);
      logger.warn("AHH");
      
      
    const sample_request_data = {
        'name':'Not currently used. Intended to be the name of the sender',
        'id': 'Not currently used. Ids are auto incremented at this point. This field is incase future more secure id systems are created.',
        'action':'The actual function that is to be executed, without parenthesis',
        'params': ['The parameters needed for the function call'],
      };
    const pass_data = {
      'name':'Chris',
      'id':54,
      'action':'do_logout'
    };
    //The array that stores the responses
    const callbacks = [];

    //Takes in request_data as shown in the sample request data
    function sendMessage(data) {
      return new Promise((resolve, reject) => {
        const key = callbacks.length;
        callbacks.push((response) => {
          resolve(response);
        });
        window.top.postMessage({ data, key }, "*");
      });
    }

    function maximizedListener() {
        let callbackFunc = "() => {console.log('Listener Recieved Event: Maximize')}";
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`windowEvents.maximized.subscribe`,
          'params': [callbackFunc],
          'factory': true,
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 
    function setPositionToken(pos) {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`windowActions.setPosition`,
          'params': [pos],
          'factory': true,
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 
    function setTitleToken(title) {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`windowActions.setTitle`,
          'params': [title],
          'factory': true,
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 

    function restoreToken() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`windowActions.restore`,
          'params': [],
          'factory': true,
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 
    function maximizeToken() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`windowActions.maximize`,
          'params': [],
          'factory': true,
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 
    function minimizeToken() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`windowActions.minimize`,
          'params': [],
          'factory': true,
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 
    function closeToken() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`windowActions.close`,
          'params': [],
          'factory': true,
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 
    function log(message, type) {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`logger.${type}`,
          'params': [message],
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    } 
    function getAll() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`ZoweZLUX.notificationManager.getAll`,
          'params': [],
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    
    }

    function push(message) {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`ZoweZLUX.notificationManager.push`,
          'params': [message],
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    }

    function removeAll() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`ZoweZLUX.notificationManager.removeAll`,
          'params': [],
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    }

    function getCount() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`ZoweZLUX.notificationManager.getCount`,
          'params': [],
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    }
    function pop() {
    
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`ZoweZLUX.notificationManager.pop`,
          'params': [],
        };

        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    }
    function getPluginDefinition(identifier) {
       
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':`pluginManager.getPlugin`,
          'params': [identifier],
        };
    
        sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    
    }
    function makeAction() {
        let actionTitle = 'Launch app from sample app';
        let actionID = 'org.zowe.zlux.sample.launch';
        let argumentFormatter = {data: {op:'deref',source:'event',path:['data']}};
        /*Actions can be made ahead of time, stored and registered at startup, but for example purposes we are making one on-the-fly.
          Actions are also typically associated with Recognizers, which execute an Action when a certain pattern is seen in the running App.
        */
        let mode = 0
        let type = 0
        let targetAppId = 'org.zowe.zlux.sample.angular'
        const request_data = {
          'name':'senderName',
          'id': 54,
          'action':'ZoweZLUX.dispatcher.makeAction',
          'params': [actionID, actionTitle, mode, type, targetAppId, argumentFormatter],
        };
        sendMessage(request_data).then((response) => {
        updateTextArea(response);
        invokeAction(response, sampleEventContext);
      });
    }

    const sampleEventContext =  {"data":{"type":"connect","connectionSettings":{"host":"localhost","port":23,"deviceType":5,"alternateHeight":60,"alternateWidth":132,"oiaEnabled":true,"security":{"type":0}}}}


    function invokeAction(action, eventContext ) {
      const request_data = {
          'name':'senderName',
          'id': 54,
          'action':'ZoweZLUX.dispatcher.invokeAction',
          'params': [action, eventContext],
      };
      sendMessage(request_data)
    
    }
    function registerApplicationCallbacks(plugin, applicationInstanceId, callbacks) {
      const request_data = {
          'name':'senderName',
          'id': 54,
          'action':'ZoweZLUX.dispatcher.registerApplicationCallbacks',
          'params': [plugin, applicationInstanceId, callbacks],
      };
    }

    function makeComponentLogger() {
      const request_data = {
          'name':'senderName',
          'id': 54,
          'action':'ZoweZLUX.logger.makeComponentLogger',
          'params': ['name'],
          'saveKey': 'logger',
          'saveResult': true,
        };
        sendMessage(request_data).then((response) => {
          updateTextArea(response);
        });
    }
    function dispatcherClear() {
      const request_data = {
          'name':'senderName',
          'id': 54,
          'action':'ZoweZLUX.dispatcher.clear'
        };
        sendMessage(request_data).then((response) => {
          updateTextArea(response);
        });
    }
    function dispatcherRunHeartbeat() {
      const request_data = {
          'name':'senderName',
          'id': 54,
          'action':'ZoweZLUX.dispatcher.runHeartbeat'
        };
        sendMessage(request_data).then((response) => {
          updateTextArea(response);
        });
    }
    function getLocale() {

      const request_data = {
        'name':'senderName',
        'id': 54,
        'action':'ZoweZLUX.globalization.getLocale'
      };
      sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    }
    function getLanguage() {

      const request_data = {
        'name':'senderName',
        'id': 54,
        'action':'ZoweZLUX.globalization.getLanguage'
      };
      sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
    }

    function receiveMessage(event) {
      const { data } = event;

      if (data.key === undefined) {
        return;
      }

      callbacks[data.key](data.value);
      delete callbacks[data.key];
    }

   window.addEventListener('message', receiveMessage, false);a
   
   function getDesktopPlugin() {
     
      const request_data = {
        'name':'senderName',
        'id': 54,
        'action':'pluginManager.getDesktopPlugin'
      };
      sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
   }   

   function loadPlugins() {
     
      const request_data = {
        'name':'senderName',
        'id': 54,
        'action':'pluginManager.loadPlugins',
        'params': ['application'],
      };
      sendMessage(request_data).then((response) => {
        updateTextArea(response);
      });
   }   
   function logFromIframe(message, type) {
     switch (type) {
       case 'info':
         logger.info(message);
         break;

       case 'warn':
         logger.warn(message);
         break;
     
       case 'severe':
         logger.severe(message);
         break; 
     
       default:
         logger.info(message);
         break;
     }
   
   }

  function updateTextArea(message) {

    if (typeof message !== 'string' && typeof message !== 'boolean' && typeof message != 'number') {
       message = JSON.stringify(message);
    }
    document.getElementById('textArea').value = message;
  } 
    

