// Generated by CoffeeScript 1.6.2
(function() {
  var BetterBird, abbrevUrl, addOptionCheckbox, addStyleOptionCheckbox, applyCss, bb_classnames, bb_datanames, bb_modules, birdBlock, body, checkVersionUpdate, createBirdBlock, createMentionsModule, createModule, createOptionsModule, createSearchModule, dashboard, doMentions, doSearch, expandUrls, filterRTs, filterUser, hasRun, iconUrls, mentions, mentionsAll, mentionsModule, options, optionsModule, pollTypeahead, regex, removeRedirects, restoreRedirects, restoreUrls, saveOptions, searchAll, searchModule, searches, searchesperhour, startMentions, startSavedSearches, typeahead, updateBrowserIcon, updateMentions, updateSavedSearch, updateSearches, updateTitleNotifier, updateTitleNotifiers, urlinterval, wrapModules, wrapper;

  bb_classnames = {
    module: "bb-module",
    expand: "bb-expand",
    direct: "bb-direct",
    savedsearch: "bb-savedsearch",
    options: "bb-options",
    birdblock: "bb-birdblock",
    content: "bb-content",
    mentions: "bb-mentions",
    notify: "bb-notify",
    clear: "bb-clear"
  };

  bb_datanames = {
    originaltext: "bb-originaltext",
    originalhref: "bb-originalhref",
    count: "bb-count"
  };

  (function($) {
    var newNotifier;

    newNotifier = function() {
      return $("<small>").addClass(bb_classnames.notify).data(bb_datanames.count, 0);
    };
    $.fn.addNotifier = function() {
      return this.append(newNotifier());
    };
    $.fn.appendNotifier = function() {
      return this.append(newNotifier());
    };
    $.fn.appendClear = function(f) {
      var c;

      if (f) {
        c = $("<a>").addClass(bb_classnames.clear).text("Clear").click(function() {
          f();
          return false;
        });
        return this.append(" &nbsp; ").append(c);
      }
      return this;
    };
    $.fn.getNotifier = function() {
      var find, selector;

      if (this.isNotifier()) {
        return this;
      }
      selector = "small." + bb_classnames.notify;
      find = this.find(selector);
      if (find.length) {
        return find;
      }
      return this.next(selector);
    };
    $.fn.getNotifierCount = function() {
      return this.getNotifier().data(bb_datanames.count);
    };
    $.fn.updateNotifier = function(count, isincrement) {
      var n;

      n = this.getNotifier();
      if (isincrement) {
        count += n.getNotifierCount();
      }
      if (n.length) {
        if (count > 0) {
          return n.data(bb_datanames.count, count).text(count + " new");
        }
        return n.data(bb_datanames.count, count).text("");
      }
      return this;
    };
    $.fn.incrementNotifier = function(count) {
      return this.updateNotifier(count, true);
    };
    $.fn.isNotifier = function() {
      return this.hasClass(bb_classnames.notify);
    };
    $.fn.hasNotifier = function() {
      return this.getNotifier().length > 0;
    };
    return $.fn.clearNotifier = function() {
      return this.getNotifier().text("").data(bb_datanames.count, 0);
    };
  })(jQuery);

  filterRTs = function(element) {
    return (element["text"] != null) && element["text"].indexOf("RT ") !== 0;
  };

  filterUser = function(username) {
    return function(element) {
      return (element["from_user"] != null) && element["from_user"] !== username.remove("@");
    };
  };

  body = $("html");

  wrapper = $("div.wrapper");

  dashboard = $("div.dashboard", wrapper);

  birdBlock = void 0;

  mentionsModule = void 0;

  searchModule = void 0;

  optionsModule = void 0;

  regex = {
    scheme: /^http[s]?:\/\/(www\.)*/,
    trailingid: /\/\d+$/g,
    trailing: /[\/\-\.\s]$/,
    fileext: /(.html|.htm|.jpg|.php|.aspx|.story)/i,
    querystring: /\?.*$/,
    nyt: /www10\.nytimes/,
    urlparts: /[\/\?]+/g
  };

  iconUrls = {
    base: chrome.extension.getURL("img/twitter_32.png"),
    notify: chrome.extension.getURL("img/twitter_32_notify.png")
  };

  checkVersionUpdate = function(callback) {
    return chrome.extension.sendRequest({
      type: "check-update"
    }, callback);
  };

  applyCss = function(options) {
    var key;

    for (key in options.styles) {
      bb_classnames[key] = "bb-" + key;
      body.toggleClass(bb_classnames[key], options.styles[key]);
    }
    return $("div#page-node-home").show();
  };

  abbrevUrl = function(url) {
    var parts;

    url = decodeURIComponent(url).remove(regex.scheme);
    if (url.split(regex.urlparts).length <= 2) {
      return url;
    }
    parts = url.replace(regex.nyt, "nytimes").remove(regex.querystring).remove(regex.fileext).remove(regex.trailing).remove(regex.trailingid).split(regex.urlparts);
    if (parts.length <= 2) {
      return parts.join("/");
    }
    parts.splice(1, parts.length - 2, "…");
    parts[this.length] = parts[this.length].split("-").slice(0, 6).join("-").split("_").slice(0, 6).join("_");
    return parts.join("/");
  };

  expandUrls = function() {
    return $("a[data-ultimate-url], a[data-expanded-url]").not("a." + bb_classnames.expand).each(function() {
      var a, u;

      a = $(this);
      u = (a.data("ultimate-url") || a.data("expanded-url")).replace(regex.nyt, "nytimes");
      return a.data(bb_datanames.originaltext, $(this).text()).href(u).text(abbrevUrl(u)).addClass(bb_classnames.expand).removeAttr("data-ultimate-url").removeAttr("data-expanded-url");
    });
  };

  restoreUrls = function() {
    return $("a." + bb_classnames.expand).filterByData(bb_datanames.originaltext).each(function() {
      var a;

      a = $(this);
      return a.text(a.data(bb_datanames.originaltext)).removeClass(bb_classnames.expand);
    });
  };

  bb_modules = [];

  createModule = function(classname, title, iconurl) {
    var d, f, h, img, m;

    h = $("<h3>").text(title).title("Hover to expand");
    d = $("<div>").addClass(bb_classnames.content).toggle(!options.collapse[classname.removePrefix()]);
    f = $("<div class='flex-module' />").append(h).append(d);
    m = $("<div class='module' />").addClass(bb_classnames.module).addClass(classname).append(f);
    img = void 0;
    if (iconurl) {
      img = $("<img>").addClass("bb-icon").src(iconurl);
      h.append(img);
    }
    m.content = d;
    m.title = h;
    m.icon = img;
    m.clearAllNotifiers = function() {
      m.content.findByClass(bb_classnames.notify).updateNotifier(0);
      updateTitleNotifier(m);
      return updateBrowserIcon(true);
    };
    m.hoverIntent((function() {
      return m.content.slideDown("fast");
    }), function() {
      if (!h.hasNotifier() || h.getNotifierCount() === 0) {
        return m.content.slideUp();
      }
    });
    m.hover((function() {
      return $(this).findByClass(bb_classnames.clear).fadeIn("fast");
    }), function() {
      return $(this).findByClass(bb_classnames.clear).fadeOut("fast");
    });
    bb_modules.push(m);
    return m;
  };

  updateBrowserIcon = function(notify) {
    return chrome.extension.sendRequest({
      type: "set-icon",
      notify: notify
    });
  };

  updateTitleNotifiers = function() {
    var total;

    total = 0;
    return bb_modules.forEach(function(module) {
      var count, notifier;

      notifier = module.title.getNotifier().first();
      if (notifier.length) {
        count = notifier.getNotifierCount();
        if (!module.is(":hover")) {
          if (count) {
            module.content.slideDown();
          } else {
            module.content.slideUp();
          }
        }
        return total += count;
      }
    });
  };

  updateTitleNotifier = function(m) {
    var notifier, notifiers, total;

    notifiers = m.content.findByClass(bb_classnames.notify);
    total = 0;
    notifiers.each(function() {
      return total += $(this).getNotifierCount();
    });
    notifier = m.title.getNotifier();
    if (total > 0) {
      notifier.updateNotifier(total).appendClear(m.clearAllNotifiers).fadeIn("fast");
      m.icon.addClass(bb_classnames.notify).src(iconUrls.notify);
    } else {
      notifier.fadeOut("fast").updateNotifier(0);
      m.icon.removeClass(bb_classnames.notify).src(iconUrls.base);
    }
    return total;
  };

  createSearchModule = function() {
    searchModule = createModule(bb_classnames.savedsearch, "Saved Searches", iconUrls.base);
    searchModule.title.appendNotifier(searchModule.clearAllNotifiers);
    searchModule.hide();
    return birdBlock.append(searchModule);
  };

  searches = [];

  searchesperhour = 150;

  typeahead = void 0;

  startSavedSearches = function() {
    $("#search-query").focus().blur();
    createSearchModule();
    return pollTypeahead();
  };

  pollTypeahead = function() {
    typeahead = $(".typeahead-searches[data-search-query]");
    if (typeahead.length > 0) {
      return searchAll();
    }
    return setTimeout(pollTypeahead, 1000);
  };

  updateSearches = function() {
    var elements;

    elements = $("a[data-search-query]", typeahead);
    return searches = $.map(elements, function(a) {
      return $(a).data("search-query");
    });
  };

  searchAll = function() {
    var searchtime;

    updateSearches();
    searches.forEach(doSearch);
    if (searches.length) {
      searchModule.show();
    }
    searchtime = 60 * 60 * 1000 * (searches.length + 1) / searchesperhour;
    return setTimeout(searchAll, searchtime);
  };

  doSearch = function(q) {
    return chrome.extension.sendRequest({
      type: "do-search",
      q: q
    }, updateSavedSearch);
  };

  updateSavedSearch = function(response) {
    var a, count, datakey, q;

    q = decodeURIComponent(response.query).replace("+", " ");
    count = response.results.filter(filterRTs).length;
    datakey = "search-query";
    a = searchModule.content.findByData("a", datakey, q);
    if (a.length === 0) {
      a = $("<a>").data(datakey, q).href("/#!/search/realtime/" + encodeURIComponent(q)).text(q).addNotifier().click(function() {
        $(this).clearNotifier();
        return updateTitleNotifier(searchModule);
      });
      searchModule.content.append($("<p>").append(a));
    }
    a.incrementNotifier(count);
    return updateTitleNotifier(searchModule);
  };

  mentions = [];

  startMentions = function() {
    var elements, searchtime;

    createMentionsModule();
    elements = $("a.account-summary div.account-group").first();
    mentions = $.map(elements, function(a) {
      return "@" + $(a).data("screen-name");
    });
    if (mentions.length) {
      mentionsAll();
      searchtime = 60 * 60 * 1000 * (searches.length + 1) / searchesperhour;
      return setInterval(mentionsAll, searchtime);
    }
  };

  createMentionsModule = function() {
    mentionsModule = createModule(bb_classnames.mentions, "Mentions", iconUrls.base);
    mentionsModule.title.appendNotifier();
    mentionsModule.hide().content.hide();
    searchModule.before(mentionsModule);
    return mentionsModule.show();
  };

  updateMentions = function(response) {
    var a, count, datakey, q;

    q = decodeURIComponent(response.query).replace("+", " ");
    count = response.results.filter(filterRTs).filter(filterUser(q)).length;
    datakey = "search-query";
    a = mentionsModule.content.findByData("a", datakey, q);
    if (a.length === 0) {
      a = $("<a>").data(datakey, q).href("/#!/mentions/").text(q).addNotifier().click(function() {
        $(this).clearNotifier();
        return updateTitleNotifier(mentionsModule);
      });
      mentionsModule.content.append($("<p>").append(a));
    }
    a.incrementNotifier(count);
    return updateTitleNotifier(mentionsModule);
  };

  mentionsAll = function() {
    return mentions.forEach(doMentions);
  };

  doMentions = function(q) {
    return chrome.extension.sendRequest({
      type: "do-search",
      q: q
    }, updateMentions);
  };

  removeRedirects = function() {
    return $("a[data-ultimate-url], a[data-expanded-url]").not("a." + bb_classnames.direct).each(function() {
      var a, u;

      a = $(this);
      u = a.data("ultimate-url") || a.data("expanded-url");
      u = u.replace(regex.nyt, "nytimes");
      return a.data(bb_datanames.originalhref, $(this).href()).href(u).addClass(bb_classnames.direct);
    });
  };

  restoreRedirects = function() {
    return $("a." + bb_classnames.direct).filterByData(bb_datanames.originalhref).each(function() {
      var a;

      a = $(this);
      return a.href(a.data(bb_datanames.originalhref)).removeClass(bb_classnames.direct);
    });
  };

  createOptionsModule = function() {
    optionsModule = createModule(bb_classnames.options, "Better Bird settings", chrome.extension.getURL("img/twitter_32.png"));
    addOptionCheckbox("expandurls", "Expand URLs", function(option) {
      if (option === true) {
        expandUrls();
        return removeRedirects();
      } else {
        restoreUrls();
        return restoreRedirects();
      }
    });
    addStyleOptionCheckbox("columnswitch", "Switch columns");
    addStyleOptionCheckbox("columnwide", "Widen content");
    addStyleOptionCheckbox("font", "Use serif font");
    addStyleOptionCheckbox("hidediscover", "Hide #Discover");
    addStyleOptionCheckbox("hidepromoted", "Hide Promoted tweets");
    addStyleOptionCheckbox("hidewho", "Hide “Who to follow”");
    addStyleOptionCheckbox("hidetrends", "Hide “Trends”");
    optionsModule.content.append($("<p>").append($("<small>").append("Created by ").append($("<a>").text("Matt Sherman").href("/#!/clipperhouse"))));
    return checkVersionUpdate(function(updated) {
      if (!updated) {
        optionsModule.content.hide();
      }
      optionsModule.hide();
      birdBlock.append(optionsModule);
      return optionsModule.show();
    });
  };

  addOptionCheckbox = function(optionkey, labeltext, callback) {
    var br, cb, label;

    cb = $("<input type='checkbox'>").id("bb-option-" + optionkey).checked(options[optionkey]).change(function() {
      options[optionkey] = $(this).is(":checked");
      saveOptions();
      if (callback) {
        return callback(options[optionkey]);
      }
    });
    label = $("<label>").text(labeltext).attrfor(cb);
    br = $("<br>");
    return optionsModule.content.append(cb).append(label).append(br);
  };

  addStyleOptionCheckbox = function(optionkey, labeltext) {
    var br, cb, label;

    cb = $("<input type='checkbox'>").id("bb-option-style-" + optionkey).checked(options.styles[optionkey]).change(function() {
      options.styles[optionkey] = $(this).is(":checked");
      body.toggleClass(bb_classnames[optionkey], options.styles[optionkey]);
      return saveOptions();
    });
    label = $("<label>").text(labeltext).attrfor(cb);
    br = $("<br>");
    return optionsModule.content.append(cb).append(label).append(br);
  };

  createBirdBlock = function() {
    birdBlock = $("<div>").addClass(bb_classnames.birdblock);
    return $("div.mini-profile", dashboard).after(birdBlock);
  };

  wrapModules = function() {
    var trendswrapper, whowrapper;

    trendswrapper = $("<div>").addClass("bb-wrapper-trends");
    $("div.module.trends", dashboard).wrap(trendswrapper);
    whowrapper = $("<div>").addClass("bb-wrapper-who");
    return $("div[data-component-term='user_recommendations']", dashboard).wrap(whowrapper);
  };

  options = void 0;

  saveOptions = function() {
    return chrome.extension.sendRequest({
      type: "save-options",
      options: options
    });
  };

  hasRun = function() {
    return chrome.extension.sendRequest({
      type: "has-run"
    });
  };

  urlinterval = void 0;

  BetterBird = {
    Init: function() {
      clearInterval(urlinterval);
      chrome.extension.sendRequest({
        type: "load-options"
      }, function(response) {
        options = response;
        applyCss(options);
        setInterval(function() {
          return applyCss(options);
        }, 100);
        setTimeout((function() {
          createBirdBlock();
          urlinterval = setInterval(function() {
            var stream;

            stream = $("div.stream");
            if (options.expandurls) {
              expandUrls();
              return removeRedirects();
            }
          }, 1500);
          if (options.savedsearches) {
            startSavedSearches();
            startMentions();
          }
          createOptionsModule();
          setInterval(updateTitleNotifiers, 2000);
          return wrapModules();
        }), 1500);
        return $(window).unload(function() {
          return hasRun();
        });
      });
      return chrome.extension.onRequest.addListener(function(request, sender, callback) {
        switch (request.type) {
          case "go-home":
            document.location.href = $("li#global-nav-home > a").href();
            return scroll(0, 0);
        }
      });
    }
  };

  if ($(document.body).is(".logged-in")) {
    BetterBird.Init();
  }

}).call(this);
