$(function () {


    var _qlb = $("#_myoQL_quickLinksBar");
    var _tfb = $("#toFromBox");
    var _uri = new URI(location.href);
    var _email = null, _productName = null, _emailType = null;
    var _body = $("#commMgrCompositionMessage");
    var _threadList = null;
    var _orderIds = [];

    var _run = function () {


        // Hey we are on the orders page
        if (_qlb.length > 0) {

            setInterval(function () {
                ((function () {
                    var _orderLinks = $("#myo-table > table > tbody > tr.order-row");
                    console.log("asdsA");
                    _orderLinks.each(function () {
                        var _lnk = $(this).find("> td:eq(2) > div:not([id]) a");
                        var _lnkOrd = $(this).find("> td:eq(2) > a");
                        var _refundStatus = $(this).find("> td:eq(4) > div:eq(3)");
                        var _products = $(this).find("> td:eq(2) > div[id]");

                        var _planks = 0;

                        _products.each(function () {
                            _planks += (($(this).text().toLowerCase().indexOf(_productName.toLowerCase()) > -1) ? 1 : 0);
                        });

                        if (_planks > 0) {
                            if (_refundStatus.css("display") !== "none") {
                                if (_orderIds.indexOf(_lnkOrd.text()) == -1)
                                    _lnk.css("color", "red");
                                else _lnk.css("color", "green");
                            } else {
                                _lnk.css("color", "orange");
                            }
                        }
                    });
                })());
            }, 2000);
            

            var _btn = $("<a/>").text("Open Emails").prop("href", "#").on("click", function () {

                var _orderLinks = $("#myo-table > table > tbody > tr.order-row");

                _orderLinks.each(function () {
                    var _lnk = $(this).find("> td:eq(2) > div:not([id]) a");
                    var _lnkOrd = $(this).find("> td:eq(2) > a");
                    var _refundStatus = $(this).find("> td:eq(4) > div:eq(3)");
                    var _products = $(this).find("> td:eq(2) > div[id]");

                    var _planks = 0;

                    _products.each(function () {
                        _planks += (($(this).text().toLowerCase().indexOf(_productName.toLowerCase()) > -1) ? 1 : 0);
                    });

                    if (_planks > 0 && _refundStatus.css("display") !== "none") {

                        if (_orderIds.indexOf(_lnkOrd.text()) == -1)
                            Send_BackgroundPage_Message("watchMovie", { url: _lnk.prop("href") });
                    }
                });

                return false;
            });

            _qlb.append(_btn);
        }

        setTimeout(function () {
            _threadList = $("#threads-list");
            if (_threadList.length > 0) {

                var _btn = $("<a/>").text("Reconcile Orders").attr("class", "").prop("href", "#").on("click", function () {

                    var _currentOrids = [];

                    var _k = [];

                    for (var i = 0; i < _orderIds.length; i++)
                        if (_k.indexOf(_orderIds[i]) === -1)
                            _k.push(_orderIds[i]);

                    _orderIds = _k;

                    chrome.runtime.sendMessage({ method: 'BOT_INTERNAL_MEMORY_SAVE', data: { 'orderIds': _orderIds }, noClear: true }, function (response) {
                        if (response)
                            console.log("Response Code: " + response.responseCode);
                    });

                    var _getMessages = function () {
                        var _messages = $("#threads-list").find("> span.click-thread");
                        var _orids = [];

                        _messages.each(function () {
                            var _txt = $(this).find("span.thread-subject").text();
                            _orids.push(_txt.substring(_txt.indexOf("(Order: ") + 8, _txt.lastIndexOf(")")));
                        });

                        return _orids;
                    };

                    var _goToNextPage = function () {
                        var _nextPage = $("#pagination-box li.a-last > a");

                        Send_BackgroundPage_Message("injectscript", { file: "next_page.js" });

                        _awaitNewMessage();
                    };

                    var _awaitNewMessage = function () {
                        setTimeout(function () {
                            var _tMsg = _getMessages();

                            if (_tMsg.length > 0) {

                                if (_currentOrids.length > 0 && _tMsg.length > 0 && _currentOrids[0] === _tMsg[0])
                                    _awaitNewMessage();
                                else if (_tMsg.length > 0) {

                                    _currentOrids = _tMsg;

                                    for (var i = 0; i < _tMsg.length; i++)
                                        if (_orderIds.indexOf(_tMsg[i]) == -1)
                                            _orderIds.push(_tMsg[i]);

                                    chrome.runtime.sendMessage({ method: 'BOT_INTERNAL_MEMORY_SAVE', data: { 'orderIds': _orderIds }, noClear: true }, function (response) {
                                        if (response)
                                            console.log("Response Code: " + response.responseCode);
                                    });

                                    _goToNextPage();
                                }
                            }

                        }, 500);
                    };

                    _awaitNewMessage();
                });

                $("#thread-list-header").append(_btn);
            }
        }, 2000);

        // Contact page
        if (_tfb.length > 0) {

            var _name = _tfb.find("> div").first();
            var _txt = _name.clone()    //clone the element
                .children() //select all the children
                .remove()   //remove all the children
                .end()  //again go back to selected element
                .text().replace("\r", "").replace("\n", "").trim();

            if (_txt.indexOf("No Buyer Name Provided") == -1)
                _body.val(_email.replace("[NAME]", _txt));


            $("#commMgrCompositionSubject").val(_emailType);
            
            $("#sendemail").on("click", function () {

                chrome.runtime.sendMessage({ method: "BOT_INTERNAL_MEMORY" }, function (data) {
                    _orderIds = data.Properties.orderIds || [];
                    _orderIds.push($("#detailsBox > div > a").text());

                    chrome.runtime.sendMessage({ method: 'BOT_INTERNAL_MEMORY_SAVE', data: { 'orderIds': _orderIds }, noClear: true }, function (response) {
                    });

                });
            });
        }

        // Close tab after sending
        if ($("a[name='Back to Manage Orders']").length > 0)
            setTimeout(function () {
                Send_BackgroundPage_Message("closeTab", null);
            }, 500);

    };

    chrome.runtime.sendMessage({ method: "BOT_INTERNAL_MEMORY" }, function (data) {
        _email = data.Properties.message || '';
        _productName = data.Properties.product || "plank";
        _emailType = data.Properties.emailType || "8";
        _orderIds = data.Properties.orderIds || [];

        _run();
    });

		
	// Open this tabs next page
	//Send_BackgroundPage_Message("openNextPage", { url: (_baseUrl + _queryString + _pageQuery + _currentPageNumber()) });

    

	function Bind_BackgroundPage_Listner() {
		chrome.runtime.onMessage.addListener(
	  		function(request, sender, sendResponse) {
	  			// Finished watching a video. Signal the search to open another video
				if (request.method == "completedWatch") {
					/*_pendingMovies--;
					
					if(_pendingMovies <= 0)
						Step_OpenNextPage();*/

					Step_OpenNextMovie();
				}
				// The content page was successfully bound to the background page
				else if (request.method == "bindSuccessfully") {
				} 
			}
		);
	}

	// Parm1: Method
	// Parm2: Object
	// Parm3: Response Function
	function Send_BackgroundPage_Message(m, o, r) {
		if( typeof(r) === "undefined")
            chrome.runtime.sendMessage({ method: m, obj: o }, function (response) {
                if (response)
			        console.log("Response Code: " + response.responseCode);
			});
		else {
			chrome.runtime.sendMessage({method: m, obj: o}, r);
		}
	}
});