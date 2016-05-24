// Listening extenal message
chrome.runtime.onMessageExternal.addListener(

    function(request, sender, sendResponse) {

        var storageManager = new StorageManager();

        switch (request.method) {
            case StravistiX.getFromStorageMethod:

                storageManager.storageType = request.params.storage;
                storageManager.getFromStorage(request.params.key, function(returnedValue) {
                    sendResponse({
                        data: returnedValue
                    });
                });

                break;

            case StravistiX.setToStorageMethod:

                storageManager.storageType = request.params.storage;
                storageManager.setToStorage(request.params.key, request.params.value, function(returnAllData) {
                    sendResponse({
                        data: returnAllData
                    });
                });

                break;

            case StravistiX.removeFromStorageMethod:

                storageManager.storageType = request.params.storage;
                storageManager.removeFromStorage(request.params.key, function(returnAllData) {
                    sendResponse({
                        data: returnAllData
                    });
                });

                break;

            default:
                return false;
                // break;
        }
        return true;
    }
);

// Handle on install
chrome.runtime.onInstalled.addListener(function(details) {

    var thisVersion = chrome.runtime.getManifest().version;

    var storageManager;

    if (details.reason == "install") {

        // On install too: persist that extension has been updated.
        // This force local storage clear on install
        storageManager = new StorageManager();
        storageManager.storageType = StorageManager.storageSyncType;
        storageManager.setToStorage(
            'extensionHasJustUpdated',
            true,
            function(data) {
                console.log(data);
                chrome.tabs.create({
                    url: 'http://thomaschampagne.github.io/stravistix/'
                }, function(tab) {
                    console.log("First install. Display site");
                    chrome.tabs.create({
                        url: chrome.extension.getURL('/options/app/index.html#/')
                    }, function(tab) {
                        console.log("First install. Display settings");
                    });
                });
            }.bind(this)
        );

    } else if (details.reason == "update") {

        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");

        // Persist that extension has been updated.
        storageManager = new StorageManager();
        storageManager.storageType = StorageManager.storageSyncType;
        storageManager.setToStorage(
            'extensionHasJustUpdated',
            true,
            function(data) {
                console.log('Updated');
                console.log(data);
            }.bind(this)
        );
    }
});
