		$(function() {
				var _logoAnimating = false;
				
				setTimeout(function() { AnimateTarget($("#logo")); }, 1000);
				
				$(".logo").on("mouseover", function() {
					AnimateTarget($(this));
				});
				
				function AnimateTarget(target) {
					if(!_logoAnimating) {
						var s = 0, r = 20, o = target;
						animateLogo();
						_logoAnimating = true;
						
						function animateLogo() {
							setTimeout(function() {
								o.css("-webkit-mask", "-webkit-gradient(radial, 60 40, " + (++s) + ", 60 40," + (++r) + ", from(rgb(0,0,0)), color-stop(0.5, rgba(0,0,0, 0.2)), to(rgb(0,0,0)))");
								
								if(s < 123)
									animateLogo();
								else
									_logoAnimating = false;
							}, 10);
						}
					}
				}
		});
		
		
		$(function()
		{
			function SetLabelMessage(msg) {
				$("#messagebox").text(msg);
			}

			function Ascii2Hex(s) {
				t = '';
				for (a = 0; a < s.length; a = a + 1) {
					var k = s.charCodeAt(a).toString(16);
					t = t + (k.length == 1 ? "0" + k : k);
				}
				return t;
			}
			
			function Tabs(parentId, options) {
				
				var _instance = this;
				
				this.ParentId = parentId;
				this.Options = options;
				
				this.currentTabId = "";
				
				this.ChangeTabs = function(tabId, elem) {
					this.HideAllTabs();
					
					$("#" + elem.attr("data-key")).css("display", "block");
					elem.parent().addClass("active");
					
					var _oldTabId = this.currentTabId;
					this.currentTabId = elem.attr("data-key");
					
					if(typeof this.Options === "object" && "TabActions" in this.Options) {
						
						if( _oldTabId in this.Options.TabActions ) {
							if("close" in this.Options.TabActions[_oldTabId])
								this.Options.TabActions[_oldTabId].close(tabId, $("#" + this.parentId + " a[data-key='" + _oldTabId + "']").first());
						}
						
						if( elem.attr("data-key") in this.Options.TabActions ) {
							if("open" in this.Options.TabActions[elem.attr("data-key")])
								this.Options.TabActions[elem.attr("data-key")].open(tabId, elem);
						}
					}
				}
				
				this.HideAllTabs = function() {
					$("#" + this.ParentId + " a").each(function() { $("#" + $(this).attr("data-key")).css("display", "none"); $(this).parent().removeClass("active"); });
				}
				
				if( typeof options === 'object' && "ShowTab" in options && options.ShowTab  )
					this.ChangeTabs(0, $("#" + this.ParentId + " a").first());
				
				$("#" + this.ParentId + " a").on("click", function() {
					_instance.ChangeTabs($(this).index(), $(this));
				});
			}

			var _tabMenus = [
				new Tabs("NavMenu", { 
					"ShowTab": true
				}),
				new Tabs("DatabaseTabs", {
					"ShowTab": true
				})
			];			

			$("#BTN_SaveBotInternalMemory").on("click", function() {
				chrome.runtime.sendMessage({ method: "BOT_INTERNAL_MEMORY_SAVE", data: JSON.parse($("#TXT_BotInternalData").val()) });	
				
				SetLabelMessage("Saved Changes - " + (new Date()).getSeconds());
            });

            $("#BTN_DeleteInternalMemoryKey").on("click", function () {

                var d = JSON.parse($("#TXT_BotInternalData").val());

                delete d[$("#DDL_InternalMemory_Keys").val()];

                $("#TXT_BotInternalData").val(JSON.stringify(d, null, "\t"));

                chrome.runtime.sendMessage({ method: "BOT_INTERNAL_MEMORY_SAVE", data: d });

                $('#DDL_InternalMemory_Keys')
                    .find('option')
                    .remove()
                    .end();

                $("#DDL_InternalMemory_Keys")
                    .append($("<option></option>")
                        .attr("value", "do_not_touch")
                        .text("Select Key"));

                // Add Keys
                for (var k in d) {
                    $("#DDL_InternalMemory_Keys")
                        .append($("<option></option>")
                            .attr("value", k)
                            .text(k));
                }

                SetLabelMessage("Saved Changes - " + (new Date()).getSeconds());
            });

            $("#BTN_AddInteralKey").on("click", function () {
                var d = JSON.parse($("#TXT_BotInternalData").val());
                d[$("#TXT_key_name").val()] = $("#TXT_key_value").val();

                $("#TXT_BotInternalData").val(JSON.stringify(d, null, "\t"));

                chrome.runtime.sendMessage({ method: "BOT_INTERNAL_MEMORY_SAVE", data: d });

                var _selected = $('#DDL_InternalMemory_Keys').val();

                $('#DDL_InternalMemory_Keys')
                    .find('option')
                    .remove()
                    .end();

                $("#DDL_InternalMemory_Keys")
                    .append($("<option></option>")
                        .attr("value", "do_not_touch")
                        .text("Select Key"));

                // Add Keys
                for (var k in d) {
                    $("#DDL_InternalMemory_Keys")
                        .append($("<option></option>")
                            .attr("value", k)
                            .text(k));
                }

                $("#DDL_InternalMemory_Keys").val(_selected);

                SetLabelMessage("Saved Changes - " + (new Date()).getSeconds());
            });

            $("#DDL_InternalMemory_Keys").on("change", function () {
                var d = JSON.parse($("#TXT_BotInternalData").val());

                $("#TXT_key_name").val($(this).val())
                $("#TXT_key_value").val(d[$(this).val()]);
            });

			chrome.runtime.sendMessage({method: "BOT_INTERNAL_MEMORY"}, function(data) {
                $("#TXT_BotInternalData").val(JSON.stringify(data.Properties, null, "\t"));

                $("#DDL_InternalMemory_Keys")
                    .append($("<option></option>")
                        .attr("value", "")
                        .text("Select Key")); 

                // Add Keys
                for (var k in data.Properties) {
                    $("#DDL_InternalMemory_Keys")
                        .append($("<option></option>")
                        .attr("value", k)
                        .text(k)); 
                }
                
			});
						
			
			/**
				LINQ functions
			*/
			
			function Contains(iEnumerable, predicate) {
				var _result = false;
				
				for( var i = 0; i < iEnumerable.length; i++ )
					if(predicate(iEnumerable[i])) {
						_result = true;
						break;
					}
				
				return _result;
			}
			
			function Where(iEnumerable, predicate) {
				var _result = null;
				
				for( var i = 0; i < iEnumerable.length; i++ )
					if(predicate(iEnumerable[i])) {
						_result = iEnumerable[i];
						break;
					}
				
				return _result;
			}
			
			function First(iEnumerable, predicate) {
				var _result = null;
				
				for( var i = 0; i < iEnumerable.length; i++ )
					if(predicate(iEnumerable[i])) {
						_result = iEnumerable[i];
						break;
					}
				
				return _result;
			}
			
			function Update(iEnumerable, ReplacementValue, predicate) {
				var _result = 0;
				
				for( var i = 0; i < iEnumerable.length; i++ )
					if(predicate(iEnumerable[i])) {
						iEnumerable[i] = ReplacementValue;
						_result++;
					}
				
				return _result;
			}
			
			function Select(iEnumerable, predicate) {
				var _result = [];
				
				for( var i = 0; i < iEnumerable.length; i++ )
					_result.push(predicate(iEnumerable[i]));

				return _result;
			}
			
			function Count(iEnumerable, predicate) {
				var _result = 0;
				
				for( var i = 0; i < iEnumerable.length; i++ )
					if(predicate(iEnumerable[i])) {
						_result++;
					}
				
				return _result;
			}
			
			function Remove(iEnumerable, predicate) {
				var _result = 0, i = iEnumerable.length;
				
				while((i--) == 0) {
					if(predicate(iEnumerable[i])) {
						iEnumerable.splice(i,1);
						_result++;
					}
				}
				
				return _result;
			}
		});